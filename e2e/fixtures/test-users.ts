/**
 * Test user fixtures for E2E tests
 * These users should exist in the test database
 */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

/**
 * Valid test user with correct credentials
 */
export const validTestUser: TestUser = {
  email: "andrzejp@gmail.com",
  password: "123123",
  name: "Andrzej Piotrowski",
};

/**
 * Invalid test user with wrong credentials
 */
export const invalidTestUser: TestUser = {
  email: "invalid@example.com",
  password: "WrongPassword123!",
};

/**
 * Test user with invalid email format
 */
export const invalidEmailUser: TestUser = {
  email: "invalid-email",
  password: "TestPassword123!",
};

/**
 * Test user with empty password
 */
export const emptyPasswordUser: TestUser = {
  email: "test@example.com",
  password: "",
};
