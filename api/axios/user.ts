import request from './request'

type PostLoginPayload = {
  mode: 'account' | 'phone',
  name?: string,
  password?: string,
  phone?: string,
  verify_code?: string,
};

type PostRegisterPayload = {
  mode: 'account' | 'phone',
  name?: string,
  password?: string,
  phone?: string,
  verify_code?: string,
}

const login = async (data: PostLoginPayload) => {
  const response = await request.post('/user/login', {
    ...data,
  });
  return response.data;
}

const register = async (data: PostRegisterPayload) => {
  const response = await request.post('/user/register', {
    ...data,
  })
  return response.data;
}

const logout = async () => {
  const response = await request.post('/user/logout')
  return response.data;
}

const sendVerificationCode = async (phone: string) => {
  const response = await request.post('/user/send-verification-code', {
    phone,
  })
  return response.data;
}

const getUserProfile = async () => {
  const response = await request.get('/user/info')
  return response.data;
}

export { login, register, logout, getUserProfile, sendVerificationCode }
