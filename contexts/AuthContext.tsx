
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

export interface Employee {
  id: string;
  user_id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  gc: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  project_number: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  currentEmployee: Employee | null;
  assignedProjects: Project[];
  currentProject: Project | null;
  loading: boolean;
  lastSubmittedPtpId: string | null;
  canDuplicatePreTask: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  refreshEmployeeData: () => Promise<void>;
  checkForPreviousPtp: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSubmittedPtpId, setLastSubmittedPtpId] = useState<string | null>(null);
  const [canDuplicatePreTask, setCanDuplicatePreTask] = useState(false);

  // Check for previous PTP submission
  const checkForPreviousPtp = async () => {
    if (!currentEmployee || !currentProject) {
      console.log('Cannot check for previous PTP: missing employee or project');
      setCanDuplicatePreTask(false);
      setLastSubmittedPtpId(null);
      return;
    }

    console.log('Checking for previous PTP submission...');
    
    try {
      const { data, error } = await supabase
        .from('submitted_ptp')
        .select('id')
        .eq('project_id', currentProject.id)
        .eq('submitted_by_employee_id', currentEmployee.id)
        .order('submitted_time', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          console.log('No previous PTP found');
          setCanDuplicatePreTask(false);
          setLastSubmittedPtpId(null);
        } else {
          console.error('Error checking for previous PTP:', error);
          setCanDuplicatePreTask(false);
          setLastSubmittedPtpId(null);
        }
      } else if (data) {
        console.log('Previous PTP found:', data.id);
        setLastSubmittedPtpId(data.id);
        setCanDuplicatePreTask(true);
      }
    } catch (error) {
      console.error('Exception checking for previous PTP:', error);
      setCanDuplicatePreTask(false);
      setLastSubmittedPtpId(null);
    }
  };

  // Load employee data from Supabase
  const loadEmployeeData = async (userId: string) => {
    console.log('Loading employee data for user:', userId);
    
    try {
      // Fetch employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (employeeError) {
        console.error('Error fetching employee:', employeeError);
        setCurrentEmployee(null);
        setAssignedProjects([]);
        return;
      }

      if (!employeeData) {
        console.log('No employee record found for user');
        setCurrentEmployee(null);
        setAssignedProjects([]);
        return;
      }

      console.log('Employee data loaded:', employeeData);
      setCurrentEmployee(employeeData);

      // Fetch assigned projects
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('project_assignments')
        .select('project_id')
        .eq('employee_id', employeeData.id)
        .eq('active', true);

      if (assignmentsError) {
        console.error('Error fetching project assignments:', assignmentsError);
        setAssignedProjects([]);
        return;
      }

      if (!assignmentsData || assignmentsData.length === 0) {
        console.log('No project assignments found');
        setAssignedProjects([]);
        return;
      }

      const projectIds = assignmentsData.map((a) => a.project_id);
      console.log('Project IDs:', projectIds);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, gc, location, start_date, end_date, status, project_number')
        .in('id', projectIds);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        setAssignedProjects([]);
        return;
      }

      console.log('Projects loaded:', projectsData);
      setAssignedProjects(projectsData || []);
    } catch (error) {
      console.error('Error in loadEmployeeData:', error);
      setCurrentEmployee(null);
      setAssignedProjects([]);
    }
  };

  // Set current project and check for previous PTP
  const setCurrentProject = async (project: Project | null) => {
    setCurrentProjectState(project);
    if (project && currentEmployee) {
      // Check for previous PTP when project is selected
      await checkForPreviousPtp();
    } else {
      setCanDuplicatePreTask(false);
      setLastSubmittedPtpId(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'Found' : 'Not found');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadEmployeeData(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadEmployeeData(session.user.id);
      } else {
        setCurrentEmployee(null);
        setAssignedProjects([]);
        setCurrentProjectState(null);
        setCanDuplicatePreTask(false);
        setLastSubmittedPtpId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for previous PTP when employee or project changes
  useEffect(() => {
    if (currentEmployee && currentProject) {
      checkForPreviousPtp();
    }
  }, [currentEmployee, currentProject]);

  const signIn = async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        Alert.alert('Login Error', error.message);
        return { error };
      }

      console.log('Sign in successful');
      
      // Load employee data
      if (data.user) {
        await loadEmployeeData(data.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      Alert.alert('Login Error', error.message || 'An unexpected error occurred');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('Signing out...');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        Alert.alert('Logout Error', error.message);
      } else {
        console.log('Sign out successful');
        setCurrentEmployee(null);
        setAssignedProjects([]);
        setCurrentProjectState(null);
        setCanDuplicatePreTask(false);
        setLastSubmittedPtpId(null);
      }
    } catch (error: any) {
      console.error('Sign out exception:', error);
      Alert.alert('Logout Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshEmployeeData = async () => {
    if (user) {
      await loadEmployeeData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        currentEmployee,
        assignedProjects,
        currentProject,
        loading,
        lastSubmittedPtpId,
        canDuplicatePreTask,
        signIn,
        signOut,
        setCurrentProject,
        refreshEmployeeData,
        checkForPreviousPtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
