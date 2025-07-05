const getUserProfile = async () => {
  const response = await fetch('/api/user/info')
  return response.json();
}

export { getUserProfile }
