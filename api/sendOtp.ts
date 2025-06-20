// api/sendOtp.ts
export const sendOtp = async (email: string) => {
  const res = await fetch("http://localhost:5000/api/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  const data = isJson ? await res.json() : null;

  if (!res.ok) throw new Error(data?.message || "Failed to send OTP");

  return data;
};
