
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';

const placeholderWorkers = [
  { name: 'Juan Perez', title: 'Foreman' },
  { name: 'Maria Lopez', title: 'Laborer' },
  { name: 'Samir Khan', title: 'Equipment Operator' },
  { name: 'Alex Johnson', title: 'Safety Officer' },
  { name: 'Carlos Rodriguez', title: 'Laborer' },
  { name: 'Emily Chen', title: 'Site Supervisor' },
];

export default function IncidentReportWorkerScreen() {
  const router = useRouter();
  const [selectedWorker, setSelectedWorker] = useState<typeof placeholderWorkers[0] | null>(null);
  const [showWorkerPicker, setShowWorkerPicker] = useState(false);
  const [incidentDate, setIncidentDate] = useState(new Date());
  const [incidentTime, setIncidentTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('123 Main Street, Chicago, IL 60611');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState(location);

  const handleNext = () => {
    if (!selectedWorker) {
      console.log('Please select a worker');
      return;
    }

    console.log('Navigating to Incident Report - Description');
    router.push({
      pathname: '/incident-report-2',
      params: {
        employeeName: selectedWorker.name,
        jobTitle: selectedWorker.title,
        incidentDate: incidentDate.toISOString(),
        incidentTime: incidentTime.toISOString(),
        location: location,
      },
    });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setIncidentTime(selectedTime);
    }
  };

  const handleLocationConfirm = () => {
    setLocation(tempLocation);
    setIsEditingLocation(false);
  };

  const handleLocationCancel = () => {
    setTempLocation(location);
    setIsEditingLocation(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Report – Worker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Employee Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Employee Name *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowWorkerPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectButtonText, !selectedWorker && styles.placeholderText]}>
              {selectedWorker ? selectedWorker.name : 'Select employee'}
            </Text>
            <IconSymbol
              ios_icon_name="chevron.down"
              android_material_icon_name="keyboard-arrow-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Job Title */}
        {selectedWorker && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Job Title</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{selectedWorker.title}</Text>
            </View>
          </View>
        )}

        {/* Date of Incident */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date of Incident</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{formatDate(incidentDate)}</Text>
          </View>
        </View>

        {/* Time of Incident */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Time of Incident *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectButtonText}>{formatTime(incidentTime)}</Text>
            <IconSymbol
              ios_icon_name="clock.fill"
              android_material_icon_name="schedule"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Location</Text>
          {!isEditingLocation ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>{location}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsEditingLocation(true);
                  setTempLocation(location);
                }}
                style={styles.editButton}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editLocationContainer}>
              <View style={styles.textInputWrapper}>
                <Text
                  style={styles.textInput}
                  onPress={() => console.log('Edit location')}
                >
                  {tempLocation}
                </Text>
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleLocationConfirm} style={styles.actionButton}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={28}
                    color={colors.success}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLocationCancel} style={styles.actionButton}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedWorker && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.7}
          disabled={!selectedWorker}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>

      {/* Worker Picker Modal */}
      <Modal
        visible={showWorkerPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWorkerPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWorkerPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Employee</Text>
              <TouchableOpacity onPress={() => setShowWorkerPicker(false)}>
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {placeholderWorkers.map((worker, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.workerOption}
                  onPress={() => {
                    setSelectedWorker(worker);
                    setShowWorkerPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.workerTitle}>{worker.title}</Text>
                  </View>
                  {selectedWorker?.name === worker.name && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={incidentTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  readOnlyField: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
  },
  readOnlyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  editButton: {
    padding: 4,
  },
  editLocationContainer: {
    gap: 12,
  },
  textInputWrapper: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  pickerScroll: {
    maxHeight: 400,
  },
  workerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  workerTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
