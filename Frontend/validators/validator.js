import z from "zod";
export const paymentSchema = z
  .object({
    firstName: z
      .string()
      .min(3, { message: "First Name should be at least 3 characters" }),
    lastName: z
      .string()
      .min(3, { message: "Last Name should be at least 3 characters" }),
    email: z.string().email(),
    confirmEmail: z.string().email(),
    country: z.string().min(1, { message: "Country is required !" }),
    state: z.string().min(1, { message: "State is required !" }),
    phoneNumber: z
      .string()
      .min(10, { message: "Number should be of 10 digits" })
      .max(10, { message: "Number should be of 10 digits" }),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Email does not match !",
    path: ["confirmEmail"],
  });

export const adminSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: "First name should be at least 3 characters." })
    .max(100, {
      message: "First name should not be more than 100 characters.",
    }),
  lastName: z
    .string()
    .min(3, { message: "Last name should be at least 3 characters." })
    .max(100, {
      message: "Last name should not be more than 100 characters.",
    }),
  email: z.string().email(),
});

export const adminPasswordSchema = z
  .object({
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters" }),
    confirmPassword: z
      .string()
      .min(4, { message: "Password must be at least 4 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["noMatch"],
  });
