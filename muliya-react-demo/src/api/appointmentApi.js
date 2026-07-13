const API_BASE_URL = "http://localhost:5000/api";

export const createAppointment = async (appointmentData) => {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(appointmentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to submit appointment request."
    );
  }

  return data;
};

export const getAppointments = async () => {
  const response = await fetch(`${API_BASE_URL}/appointments`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to retrieve appointments."
    );
  }

  return data.appointments;
};

export const updateAppointmentStatus = async (
  appointmentId,
  status
) => {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to update appointment status."
    );
  }

  return data.appointment;
};