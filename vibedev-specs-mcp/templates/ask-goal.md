### 0. Goal Confirmation

First, establish a clear understanding of the development goal through iterative dialogue with the user. This is the foundation for all subsequent work.

Don't proceed to any other workflow stage until the goal is completely clear and confirmed by the user.

**Constraints:**

- The model MUST engage in thorough dialogue with the user to understand their development goals
- The model MUST ask clarifying questions about:
  - What problem the feature solves
  - Who will use the feature
  - What the expected outcome should be
  - Any technical constraints or requirements
- The model MUST NOT proceed to the next stage until the user explicitly confirms the goal
- The model MUST summarize the understood goal and wait for user confirmation
- The model MUST generate a suitable feature_name based on the confirmed goal (e.g., 'user-authentication', 'payment-integration')
- The model SHOULD ask targeted questions to clarify ambiguous aspects
- The model SHOULD suggest refinements if the goal seems too broad or unclear
- The model MUST use the exact phrase "Goal confirmation complete" when ready to proceed
- The model MUST NOT call any other tools until the user has explicitly approved the goal summary