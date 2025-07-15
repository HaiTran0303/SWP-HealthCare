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
