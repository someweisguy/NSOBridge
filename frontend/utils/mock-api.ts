/**
 * Used to mock API responses in storybook stories.
 *
 * @param data The data which should be wrapped in an API response.
 * @param statusCode the HTTP status code.
 * @returns An API response.
 */
export const mockApiResponse = <T = unknown>(data: T, statusCode = 200) => {
  return {
    data: data,
    statusCode: statusCode,
    timestamp: new Date().toString(),
  };
};
