export interface CreateStiAppointmentDto {
  stiServiceId: string;
  consultantId?: string;
  sampleCollectionDate: string;
  sampleCollectionLocation: "online" | "office";
  notes?: string;
}

export interface Appointment {
  // Define properties of the Appointment object based on your application's needs
  // The swagger file indicates it's a generic "Appointment" object,
  // so I'll put a placeholder. You might need to fill this out more completely
  // based on other parts of your application that use a full Appointment object.
  id: string;
  // ... other common appointment properties if available from swagger or other context
}

export interface FindAvailableSlotsDto {
  serviceIds?: string[];
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  consultantId?: string;
}

export interface AvailableSlotDto {
  dateTime: string;
  consultant: any; // You might want to define a more specific type for consultant
  availabilityId: string;
  remainingSlots: number;
}

export interface FindAvailableSlotsResponseDto {
  availableSlots: AvailableSlotDto[];
  totalSlots: number;
  totalConsultants: number;
  message?: string;
}

export interface StiProcess {
  id: string;
  testCode: string;
  status: "ordered" | "sample_collection_scheduled" | "sample_collected" | "processing" | "result_ready" | "result_delivered" | "consultation_required" | "follow_up_scheduled" | "completed" | "cancelled";
  sampleType: "blood" | "urine" | "swab" | "saliva" | "other";
  priority: "normal" | "high" | "urgent";
  estimatedResultDate: string | null;
  actualResultDate: string | null;
  sampleCollectionDate: string | null;
  sampleCollectionLocation: string | null;
  processNotes: string | null;
  labNotes: string | null;
  sampleCollectedBy: string | null;
  labProcessedBy: string | null;
  requiresConsultation: boolean;
  patientNotified: boolean;
  resultEmailSent: boolean;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    fullName: string;
    // Add other patient details if available from swagger if needed
  } | null;
  service: {
    id: string;
    name: string;
    // Add other service details if available from swagger if needed
  } | null;
  appointment: {
    id: string;
    // Add other appointment details if available from swagger if needed
  } | null;
  testResult: any | null; // Define a proper type for TestResult if available
  consultantDoctor: {
    id: string;
    name: string;
    // Add other consultant details if available from swagger if needed
  } | null;
}

export interface UpdateStiProcessStatusDto {
  status: "ordered" | "sample_collection_scheduled" | "sample_collected" | "processing" | "result_ready" | "result_delivered" | "consultation_required" | "follow_up_scheduled" | "completed" | "cancelled";
}
