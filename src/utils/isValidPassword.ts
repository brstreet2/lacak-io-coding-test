/**
 * Function ini untuk mengeck validasi password,
 * password harus memiliki 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 simbol
 * minimal 5 karakter.
 */
export const isValidPassword = (password: string) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
  return regex.test(password);
};
