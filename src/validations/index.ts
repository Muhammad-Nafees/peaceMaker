import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._]+@[a-zA-Z._]+\.[a-zA-Z]{1,}$/, 'Invalid email')
    .required('Email is required'),
  password: Yup.string().required('Password is required'),
}); 

const baseSignUpSchema = {
  firstName: Yup.string()
    // .matches(/^[A-Za-z]+$/)
    .required('First name is required')
    .matches(/^\S*$/, 'First name cannot contain spaces')
    .matches(/^[A-Za-z]*$/, 'Please enter a valid name.'),
  lastName: Yup.string()
    .required('Last name is required')
    .matches(/^\S*$/, 'Last name cannot contain spaces')
    .matches(/^[A-Za-z]*$/, 'Please enter a valid name.'),
  month: Yup.string().required('select MM'),
  day: Yup.string().required('select DD'),
  year: Yup.string().required('select YYYY'),
  location: Yup.string().required('Location is required'),
  height: Yup.string().required('Height is required'),
  weight: Yup.string().required('Weight is required'),

  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])/,
      'Password must contain at least one uppercase and one lowercase letter',
    )
    .required('Password is required'),
};

export const signupSchema = Yup.object().shape({
  ...baseSignUpSchema,
  email: Yup.string()
    .matches(/^[a-zA-Z0-9._]+@[a-zA-Z._]+\.[a-zA-Z]{1,}$/, 'Invalid email')
    .required('Email is required'),
});

export const signupSchemaSocail = Yup.object().shape({
  ...baseSignUpSchema,
  email: Yup.string(),
});

export const forgetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    // .matches(/^[a-zA-Z0-9._]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/, 'Invalid email')
    .required('Email is required'),
});

export const newPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'New password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])/,
      'Password must contain at least one uppercase and one lowercase letter',
    )
    .required('New Password is required'),
  confirmPassword: Yup.string()
    .min(8, 'Confirm password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])/,
      'Password must contain at least one uppercase and one lowercase letter',
    )
    .required('Confirm Password is required')
    .oneOf([Yup.ref('newPassword')], 'Password not the same with new password'),
});
