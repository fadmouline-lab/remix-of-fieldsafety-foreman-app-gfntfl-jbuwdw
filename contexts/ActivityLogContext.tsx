
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface QuestionState {
  value: boolean;
  description: string;
}

interface PhotoAttachment {
  uri: string;
  storagePath?: string;
  mimeType: string;
  isExisting?: boolean;
}

interface VoiceMemoAttachment {
  id: string;
  duration: string;
  durationSeconds?: number;
  storagePath?: string;
  isExisting?: boolean;
}

interface ActivityLogContextType {
  // Page 1 data
  nearMiss: QuestionState;
  incident: QuestionState;
  observation: QuestionState;
  setNearMiss: (state: QuestionState) => void;
  setIncident: (state: QuestionState) => void;
  setObservation: (state: QuestionState) => void;
  
  // Page 2 data
  photos: PhotoAttachment[];
  voiceMemos: VoiceMemoAttachment[];
  generalNotes: string;
  setPhotos: (photos: PhotoAttachment[]) => void;
  setVoiceMemos: (memos: VoiceMemoAttachment[]) => void;
  setGeneralNotes: (notes: string) => void;
  
  // Edit mode
  editingActivityLogId: string | null;
  setEditingActivityLogId: (id: string | null) => void;
  
  // Actions
  loadActivityLogForEdit: (id: string) => Promise<void>;
  submitActivityLog: () => Promise<boolean>;
  clearFormData: () => void;
  
  // Loading state
  loading: boolean;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const { currentEmployee, currentProject } = useAuth();
  
  // Page 1 state
  const [nearMiss, setNearMiss] = useState<QuestionState>({ value: false, description: '' });
  const [incident, setIncident] = useState<QuestionState>({ value: false, description: '' });
  const [observation, setObservation] = useState<QuestionState>({ value: false, description: '' });
  
  // Page 2 state
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [voiceMemos, setVoiceMemos] = useState<VoiceMemoAttachment[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  
  // Edit mode
  const [editingActivityLogId, setEditingActivityLogId] = useState<string | null>(null);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  const clearFormData = () => {
    setNearMiss({ value: false, description: '' });
    setIncident({ value: false, description: '' });
    setObservation({ value: false, description: '' });
    setPhotos([]);
    setVoiceMemos([]);
    setGeneralNotes('');
    setEditingActivityLogId(null);
  };

  const loadActivityLogForEdit = async (id: string) => {
    if (!currentEmployee || !currentProject) {
      console.error('Cannot load activity log: missing employee or project');
      return;
    }

    console.log('Loading activity log for edit:', id);
    setLoading(true);

    try {
      // Load parent row
      const { data: logData, error: logError } = await supabase
        .from('daily_activity_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (logError) {
        console.error('Error loading activity log:', logError);
        Alert.alert('Error', 'Failed to load activity log');
        return;
      }

      if (!logData) {
        console.error('Activity log not found');
        Alert.alert('Error', 'Activity log not found');
        return;
      }

      console.log('Activity log loaded:', logData);

      // Set page 1 data
      setNearMiss({
        value: logData.near_miss || false,
        description: logData.near_miss_details || '',
      });
      setIncident({
        value: logData.incident || false,
        description: logData.incident_details || '',
      });
      setObservation({
        value: logData.observation || false,
        description: logData.observation_details || '',
      });
      setGeneralNotes(logData.general_notes || '');

      // Load photos
      const { data: photosData, error: photosError } = await supabase
        .from('daily_activity_log_photos')
        .select('*')
        .eq('activity_log_id', id)
        .eq('is_active', true);

      if (photosError) {
        console.error('Error loading photos:', photosError);
      } else if (photosData) {
        console.log('Photos loaded:', photosData.length);
        
        // Get signed URLs for photos
        const photosWithUrls = await Promise.all(
          photosData.map(async (photo) => {
            const { data: signedUrlData } = await supabase.storage
              .from('activity-log-photos')
              .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

            return {
              uri: signedUrlData?.signedUrl || '',
              storagePath: photo.storage_path,
              mimeType: photo.mime_type || 'image/jpeg',
              isExisting: true,
            };
          })
        );

        setPhotos(photosWithUrls);
      }

      // Load voice memos
      const { data: memosData, error: memosError } = await supabase
        .from('daily_activity_log_voice_memos')
        .select('*')
        .eq('activity_log_id', id)
        .eq('is_active', true);

      if (memosError) {
        console.error('Error loading voice memos:', memosError);
      } else if (memosData) {
        console.log('Voice memos loaded:', memosData.length);
        
        const memosWithData = memosData.map((memo, index) => ({
          id: memo.id,
          duration: formatDuration(memo.duration_seconds || 0),
          durationSeconds: memo.duration_seconds || 0,
          storagePath: memo.storage_path,
          isExisting: true,
        }));

        setVoiceMemos(memosWithData);
      }

      setEditingActivityLogId(id);
    } catch (error) {
      console.error('Exception loading activity log:', error);
      Alert.alert('Error', 'Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadPhoto = async (photoUri: string, activityLogId: string): Promise<string | null> => {
    if (!currentEmployee || !currentProject) {
      console.error('Cannot upload photo: missing employee or project');
      return null;
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `photo_${timestamp}.jpg`;
      const storagePath = `${currentEmployee.org_id}/${currentProject.id}/${activityLogId}/${filename}`;

      console.log('Uploading photo to:', storagePath);

      // Fetch the image as a blob
      const response = await fetch(photoUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('activity-log-photos')
        .upload(storagePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return null;
      }

      console.log('Photo uploaded successfully');
      return storagePath;
    } catch (error) {
      console.error('Exception uploading photo:', error);
      return null;
    }
  };

  const uploadVoiceMemo = async (memoData: any, activityLogId: string): Promise<string | null> => {
    if (!currentEmployee || !currentProject) {
      console.error('Cannot upload voice memo: missing employee or project');
      return null;
    }

    try {
      // For now, we'll just return a placeholder path
      // In a real implementation, you would upload the actual audio file
      const timestamp = Date.now();
      const filename = `memo_${timestamp}.m4a`;
      const storagePath = `${currentEmployee.org_id}/${currentProject.id}/${activityLogId}/${filename}`;

      console.log('Voice memo storage path:', storagePath);
      
      // TODO: Implement actual audio file upload
      // For now, just return the path
      return storagePath;
    } catch (error) {
      console.error('Exception uploading voice memo:', error);
      return null;
    }
  };

  const submitActivityLog = async (): Promise<boolean> => {
    if (!currentEmployee || !currentProject) {
      console.error('Cannot submit: missing employee or project');
      Alert.alert('Error', 'Missing employee or project information');
      return false;
    }

    console.log('Submitting activity log...');
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      let activityLogId = editingActivityLogId;

      // Step A: Create or Update parent row
      if (!editingActivityLogId) {
        // CREATE new activity log
        console.log('Creating new activity log...');
        
        const { data: newLog, error: createError } = await supabase
          .from('daily_activity_logs')
          .insert({
            org_id: currentEmployee.org_id,
            project_id: currentProject.id,
            submitted_by_employee_id: currentEmployee.id,
            work_date: today,
            near_miss: nearMiss.value,
            near_miss_details: nearMiss.value ? nearMiss.description : null,
            incident: incident.value,
            incident_details: incident.value ? incident.description : null,
            observation: observation.value,
            observation_details: observation.value ? observation.description : null,
            general_notes: generalNotes || null,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating activity log:', createError);
          Alert.alert('Error', 'Failed to create activity log');
          return false;
        }

        activityLogId = newLog.id;
        console.log('Activity log created:', activityLogId);
      } else {
        // UPDATE existing activity log
        console.log('Updating existing activity log:', editingActivityLogId);
        
        // First, get the current revision
        const { data: currentLog, error: fetchError } = await supabase
          .from('daily_activity_logs')
          .select('revision')
          .eq('id', editingActivityLogId)
          .single();

        if (fetchError) {
          console.error('Error fetching current log:', fetchError);
          Alert.alert('Error', 'Failed to fetch current log');
          return false;
        }

        const newRevision = (currentLog?.revision || 1) + 1;

        const { error: updateError } = await supabase
          .from('daily_activity_logs')
          .update({
            near_miss: nearMiss.value,
            near_miss_details: nearMiss.value ? nearMiss.description : null,
            incident: incident.value,
            incident_details: incident.value ? incident.description : null,
            observation: observation.value,
            observation_details: observation.value ? observation.description : null,
            general_notes: generalNotes || null,
            updated_by_employee_id: currentEmployee.id,
            revision: newRevision,
          })
          .eq('id', editingActivityLogId);

        if (updateError) {
          console.error('Error updating activity log:', updateError);
          Alert.alert('Error', 'Failed to update activity log');
          return false;
        }

        console.log('Activity log updated');
      }

      // Step B: Handle photo attachments
      if (editingActivityLogId) {
        // Editing mode: deactivate removed photos
        const existingPhotoPaths = photos
          .filter((p) => p.isExisting && p.storagePath)
          .map((p) => p.storagePath!);

        // Get all active photos from DB
        const { data: dbPhotos } = await supabase
          .from('daily_activity_log_photos')
          .select('storage_path')
          .eq('activity_log_id', editingActivityLogId)
          .eq('is_active', true);

        if (dbPhotos) {
          const removedPhotoPaths = dbPhotos
            .map((p) => p.storage_path)
            .filter((path) => !existingPhotoPaths.includes(path));

          if (removedPhotoPaths.length > 0) {
            console.log('Deactivating removed photos:', removedPhotoPaths.length);
            await supabase
              .from('daily_activity_log_photos')
              .update({ is_active: false })
              .eq('activity_log_id', editingActivityLogId)
              .in('storage_path', removedPhotoPaths);
          }
        }
      }

      // Upload and insert new photos
      const newPhotos = photos.filter((p) => !p.isExisting);
      console.log('Uploading new photos:', newPhotos.length);

      for (const photo of newPhotos) {
        const storagePath = await uploadPhoto(photo.uri, activityLogId!);
        
        if (storagePath) {
          const { error: photoError } = await supabase
            .from('daily_activity_log_photos')
            .insert({
              activity_log_id: activityLogId,
              org_id: currentEmployee.org_id,
              project_id: currentProject.id,
              storage_path: storagePath,
              mime_type: photo.mimeType,
            });

          if (photoError) {
            console.error('Error inserting photo record:', photoError);
          }
        }
      }

      // Step C: Handle voice memo attachments
      if (editingActivityLogId) {
        // Editing mode: deactivate removed memos
        const existingMemoPaths = voiceMemos
          .filter((m) => m.isExisting && m.storagePath)
          .map((m) => m.storagePath!);

        // Get all active memos from DB
        const { data: dbMemos } = await supabase
          .from('daily_activity_log_voice_memos')
          .select('storage_path')
          .eq('activity_log_id', editingActivityLogId)
          .eq('is_active', true);

        if (dbMemos) {
          const removedMemoPaths = dbMemos
            .map((m) => m.storage_path)
            .filter((path) => !existingMemoPaths.includes(path));

          if (removedMemoPaths.length > 0) {
            console.log('Deactivating removed voice memos:', removedMemoPaths.length);
            await supabase
              .from('daily_activity_log_voice_memos')
              .update({ is_active: false })
              .eq('activity_log_id', editingActivityLogId)
              .in('storage_path', removedMemoPaths);
          }
        }
      }

      // Upload and insert new voice memos
      const newMemos = voiceMemos.filter((m) => !m.isExisting);
      console.log('Uploading new voice memos:', newMemos.length);

      for (const memo of newMemos) {
        const storagePath = await uploadVoiceMemo(memo, activityLogId!);
        
        if (storagePath) {
          const { error: memoError } = await supabase
            .from('daily_activity_log_voice_memos')
            .insert({
              activity_log_id: activityLogId,
              org_id: currentEmployee.org_id,
              project_id: currentProject.id,
              storage_path: storagePath,
              duration_seconds: memo.durationSeconds || 0,
            });

          if (memoError) {
            console.error('Error inserting voice memo record:', memoError);
          }
        }
      }

      console.log('Activity log submitted successfully');
      return true;
    } catch (error) {
      console.error('Exception submitting activity log:', error);
      Alert.alert('Error', 'Failed to submit activity log');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActivityLogContext.Provider
      value={{
        nearMiss,
        incident,
        observation,
        setNearMiss,
        setIncident,
        setObservation,
        photos,
        voiceMemos,
        generalNotes,
        setPhotos,
        setVoiceMemos,
        setGeneralNotes,
        editingActivityLogId,
        setEditingActivityLogId,
        loadActivityLogForEdit,
        submitActivityLog,
        clearFormData,
        loading,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (context === undefined) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
}
