const flags = {
  USE_SERVER: true,
  SERVER_URL: "http://127.0.0.1:5000"
};

export const shouldUseServer = () => {
  return flags.USE_SERVER;
};

export const getServerUrl = () => {
  return flags.SERVER_URL;
};

export default flags;
