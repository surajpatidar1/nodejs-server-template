export const create = async (data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dialCode?: string;
  mobile?: string;
  profileImage?: string;
  country?: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  return {
    success: true,
    message: 'User created successfully .',
  };
};
