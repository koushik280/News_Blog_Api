import bcrypt from "bcrypt";

/**
 * Hash plain text password
 */
export const hashPassword = async (plainPassword) => {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
};

/**
 * Compare plain password with hashed password
 */
export const comparePassword = async (
  plainPassword,
  hashedPassword
) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

