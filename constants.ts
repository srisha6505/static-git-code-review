export const APP_NAME = "IIC reviews";

// Authentication Credentials from environment variables
export const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "";
export const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "";

// HSL Colors as strings for inline styles where Tailwind classes aren't enough
export const COLORS = {
  bg: "hsl(220, 10%, 10%)",
  surface1: "hsl(220, 10%, 14%)",
  surface2: "hsl(220, 10%, 18%)",
  surface3: "hsl(220, 10%, 22%)",
  primary: "hsl(260, 70%, 60%)",
};
