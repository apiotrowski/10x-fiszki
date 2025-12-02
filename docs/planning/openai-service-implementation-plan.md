# OpenAI Service Implementation Plan

## 1. Service Description
The OpenAI service is designed to interact with the OpenAI API using the gpt-4o-mini model for LLM-based chats. It will accept a text input (ranging from 1000 to 10000 words) and a desired number of flashcards to generate. The generated flashcards will adhere to the types specified in the generation validation (i.e. question-answer and gaps types), with flashcard quantity estimates aligning with the input text length (e.g., 10-15 flashcards for 1000 words and 30-50 flashcards for 10000 words).

## 2. Constructor Description
The service constructor will initialize the necessary configuration properties, including:
- API key and endpoint configuration for the OpenAI API.
- Default model parameters (e.g., model name: gpt-4o-mini, temperature, and other relevant options).
- Response format specifications based on a JSON schema.

## 3. Public Methods and Fields
1. `generateFlashcardsWithAI(text: string, numberOfFlashcards: number): Promise<AIFlashcard[]>`
   - **Functionality**: Receives raw text and a target number of flashcards. It validates the input, formats system and user messages, configures the API call with proper model parameters and response format, and then processes the API response to return validated flashcards.
   - **Key Steps**:
     1. Validate that the input text length is within the required range (1000 to 10000 words).
     2. Construct a system message (e.g., "You are a flashcard generator. Ensure your output adheres to the provided JSON schema.")
     3. Construct a user message from the provided text.
     4. Specify a structured `response_format` using a JSON schema. For example:
        ```json
        { "type": "json_schema", "json_schema": { "name": "AIGenerationResponse", "strict": true, "schema": { "flashcards": { "type": "array", "items": { "type": "object", "properties": { "type": { "type": "string" }, "front": { "type": "string" }, "back": { "type": "string" } }, "required": ["type", "front", "back"] } } } } }
        ```
     5. Invoke the OpenAI API asynchronously and validate the response against the expected schema.
2. Public configuration fields to allow adjustment of:
   - API key
   - Model name and parameters
   - Response format (JSON schema)

## 4. Private Methods and Fields
1. **Private Fields**:
   - `_openAiApiKey`: Holds the secret API key used for authenticating with the OpenAI API.
   - `_apiEndpoint`: Stores the API endpoint URL.
   - `_defaultParams`: Contains default model parameters (temperature, max tokens, etc.).
2. **Private Methods**:
   1. `_buildSystemMessage(): string`
      - Constructs the system message guiding the API response (e.g., instructing that the output must adhere to the provided JSON schema).
   2. `_buildUserMessage(text: string): string`
      - Formats the user message from the input text.
   3. `_buildResponseFormat(): object`
      - Constructs the response format JSON schema. Example:
        ```json
        { "type": "json_schema", "json_schema": { "name": "AIGenerationResponse", "strict": true, "schema": { "flashcards": { "type": "array", "items": { "type": "object", "properties": { "type": { "type": "string" }, "front": { "type": "string" }, "back": { "type": "string" } }, "required": ["type", "front", "back"] } } } } }
        ```
   4. `_handleApiResponse(response: any): AIFlashcard[]`
      - Validates and parses the API response, ensuring it conforms to the expected structure.

## 5. Error Handling
Potential error scenarios include:
1. **Invalid Input Length**
   - *Challenge*: The provided text is either too short or too long.
   - *Solution*: Validate the input prior to API invocation and return a clear error if validation fails.

2. **API Request Failures**
   - *Challenge*: Failure due to network issues, invalid API key, or service downtime.
   - *Solution*: Implement retry logic with exponential backoff and return user-friendly error messages.

3. **Invalid API Response**
   - *Challenge*: The API response does not match the expected JSON schema.
   - *Solution*: Validate the response using schema validation (e.g., Zod), and throw descriptive errors if validation fails.

4. **Unexpected Errors**
   - *Challenge*: Unanticipated runtime errors during processing.
   - *Solution*: Use try-catch blocks to handle exceptions, log errors securely, and return a generic error message to the user.

## 6. Security Considerations
1. **API Key Management**: Store API keys in environment variables or secure configuration files, avoiding hardcoding.
2. **Input Sanitization**: Perform thorough validation and sanitization on user inputs to prevent injection attacks.
3. **HTTPS Enforcement**: Ensure all API calls use HTTPS to secure data in transit.
4. **Error Logging**: Log detailed error information securely while presenting generic error messages to users.

## 7. Step-by-Step Implementation Plan
1. **Initial Setup**:
   - Configure secure storage for the OpenAI API key and endpoint using environment variables.
   - Reference the `src/lib/services/ai.service.ts` file for integrating the service.

2. **Define Interfaces and Schemas**:
   - Use the existing Zod schemas from `src/lib/validations/generation.validation.ts` for input and output validation.
   - Define a JSON schema for the expected API response (structured response) as outlined above.

3. **Constructor Implementation**:
   - Initialize private fields (`_openAiApiKey`, `_apiEndpoint`, `_defaultParams`) with values from environment/configuration.
   - Set default parameters appropriate for the gpt-4o-mini model (e.g., temperature, max tokens).

4. **Public Method Development**:
   - Implement `generateFlashcardsWithAI` to:
     - Validate input text length and number of flashcards.
     - Build the system and user messages using private helper methods.
     - Construct the payload, including model name, parameters, messages, and response format.
     - Execute the API call and process the response.

5. **Private Methods Implementation**:
   - Develop `_buildSystemMessage`, `_buildUserMessage`, and `_buildResponseFormat`.
   - Implement `_handleApiResponse` to validate and parse the API response using the defined JSON schema.

6. **Integrate Error Handling Mechanisms**:
   - Wrap API calls in try-catch blocks.
   - Implement retry logic for transient network errors and comprehensive logging.

7. **Testing and Validation**:
   - Create unit tests (e.g., in `src/lib/services/__tests__/generation.service.test.ts`) to cover edge cases, success scenarios, and error handling.
   - Use API mocks to simulate responses for both typical and error scenarios.

8. **Documentation and Code Review**:
   - Document code changes and update inline comments to describe functionality and configuration usage.
   - Review to ensure adherence to coding practices and security standards.

9. **Deployment Considerations**:
   - After thorough testing, integrate the new service into the production build pipeline.
   - Monitor logs and error reports to ensure stability and security in the production environment.
