/**
 * Nika v1.0
 *
 * Conversation Context + Memory Layer
 *
 * Responsibility:
 * - maintain short-term conversation context;
 * - maintain Nika runtime state associated with a user;
 * - maintain structured long-term memory;
 * - expose a clean context object to nika.js;
 *
 * This module does NOT:
 * - define Nika's personality;
 * - select the AI provider;
 * - make safety decisions;
 * - decide consent;
 * - decide relationship transitions;
 * - generate responses.
 *
 * Those responsibilities belong to other layers.
 */

const DEFAULT_CONTEXT_LIMIT = 20;
const DEFAULT_MEMORY_LIMIT = 100;

class NikaConversation {
  constructor(options = {}) {
    this.contextLimit = options.contextLimit || DEFAULT_CONTEXT_LIMIT;
    this.memoryLimit = options.memoryLimit || DEFAULT_MEMORY_LIMIT;

    /**
     * Short-term conversation history.
     *
     * Map<userId, Array<Message>>
     */
    this.conversations = new Map();

    /**
     * Long-term structured memory.
     *
     * Map<userId, MemoryState>
     */
    this.memories = new Map();

    /**
     * Runtime state that must survive between messages.
     *
     * Map<userId, NikaState>
     *
     * Relationship and consent are stored here as state,
     * but their transitions are controlled by nika.js.
     */
    this.states = new Map();
  }

  /**
   * Normalize user identifier.
   */
  normalizeUserId(userId) {
    if (userId === undefined || userId === null) {
      throw new Error('NikaConversation: userId is required');
    }

    return String(userId);
  }

  /**
   * Create an empty runtime state.
   *
   * The initial values are deliberately conservative.
   * nika.js is responsible for changing them according
   * to the actual state machine.
   */
  createDefaultState() {
    return {
      relationshipState: 'NEW',
      consentState: 'UNKNOWN',
      interactionMode: 'NEUTRAL',

      adultVerified: false,

      lastActivityAt: null,

      metadata: {}
    };
  }

  /**
   * Get runtime state for a user.
   */
  getState(userId) {
    const id = this.normalizeUserId(userId);

    if (!this.states.has(id)) {
      this.states.set(id, this.createDefaultState());
    }

    return this.states.get(id);
  }

  /**
   * Replace runtime state.
   *
   * State transitions themselves must be performed by
   * the runtime/orchestrator rather than this class.
   */
  setState(userId, state) {
    const id = this.normalizeUserId(userId);

    if (!state || typeof state !== 'object') {
      throw new Error('NikaConversation: state must be an object');
    }

    this.states.set(id, {
      ...this.createDefaultState(),
      ...state,
      metadata: {
        ...this.createDefaultState().metadata,
        ...(state.metadata || {})
      }
    });

    return this.states.get(id);
  }

  /**
   * Update selected runtime-state fields.
   */
  updateState(userId, patch = {}) {
    const current = this.getState(userId);

    return this.setState(userId, {
      ...current,
      ...patch,
      metadata: {
        ...current.metadata,
        ...(patch.metadata || {})
      }
    });
  }

  /**
   * Get short-term conversation history.
   */
  getHistory(userId) {
    const id = this.normalizeUserId(userId);

    if (!this.conversations.has(id)) {
      this.conversations.set(id, []);
    }

    return this.conversations.get(id);
  }

  /**
   * Add a message to short-term context.
   */
  addMessage(userId, role, content, metadata = {}) {
    const id = this.normalizeUserId(userId);

    if (!role) {
      throw new Error('NikaConversation: message role is required');
    }

    if (content === undefined || content === null) {
      throw new Error('NikaConversation: message content is required');
    }

    const history = this.getHistory(id);

    const message = {
      role,
      content: String(content),
      timestamp: Date.now(),
      metadata: {
        ...metadata
      }
    };

    history.push(message);

    if (history.length > this.contextLimit) {
      history.splice(0, history.length - this.contextLimit);
    }

    return message;
  }

  /**
   * Add a user message.
   */
  addUserMessage(userId, content, metadata = {}) {
    return this.addMessage(
      userId,
      'user',
      content,
      metadata
    );
  }

  /**
   * Add an assistant/Nika message.
   */
  addAssistantMessage(userId, content, metadata = {}) {
    return this.addMessage(
      userId,
      'assistant',
      content,
      metadata
    );
  }

  /**
   * Return a copy of conversation history.
   *
   * Returning a copy prevents external code from mutating
   * internal conversation state accidentally.
   */
  getHistorySnapshot(userId) {
    return this.getHistory(userId).map(message => ({
      ...message,
      metadata: {
        ...(message.metadata || {})
      }
    }));
  }

  /**
   * Clear short-term conversation history.
   *
   * Long-term memory and runtime state are intentionally preserved.
   */
  clearConversation(userId) {
    const id = this.normalizeUserId(userId);

    this.conversations.set(id, []);

    return true;
  }

  /**
   * Get long-term memory container.
   */
  getMemory(userId) {
    const id = this.normalizeUserId(userId);

    if (!this.memories.has(id)) {
      this.memories.set(id, {
        facts: [],
        preferences: [],
        interactionPreferences: [],
        relationshipNotes: [],
        importantEvents: []
      });
    }

    return this.memories.get(id);
  }

  /**
   * Add a structured memory item.
   *
   * Memory is explicit and structured.
   * Nika must never invent memory entries.
   */
  addMemory(userId, category, value, metadata = {}) {
    const allowedCategories = [
      'facts',
      'preferences',
      'interactionPreferences',
      'relationshipNotes',
      'importantEvents'
    ];

    if (!allowedCategories.includes(category)) {
      throw new Error(
        `NikaConversation: unsupported memory category "${category}"`
      );
    }

    if (value === undefined || value === null || value === '') {
      throw new Error('NikaConversation: memory value is required');
    }

    const memory = this.getMemory(userId);

    const entry = {
      value,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        ...metadata
      }
    };

    memory[category].push(entry);

    if (memory[category].length > this.memoryLimit) {
      memory[category].splice(
        0,
        memory[category].length - this.memoryLimit
      );
    }

    return entry;
  }

  /**
   * Update an existing memory entry.
   */
  updateMemory(userId, category, index, patch = {}) {
    const memory = this.getMemory(userId);

    if (!Array.isArray(memory[category])) {
      throw new Error(
        `NikaConversation: unsupported memory category "${category}"`
      );
    }

    if (!memory[category][index]) {
      return null;
    }

    memory[category][index] = {
      ...memory[category][index],
      ...patch,
      updatedAt: Date.now(),
      metadata: {
        ...(memory[category][index].metadata || {}),
        ...(patch.metadata || {})
      }
    };

    return memory[category][index];
  }

  /**
   * Remove one memory entry.
   */
  removeMemory(userId, category, index) {
    const memory = this.getMemory(userId);

    if (!Array.isArray(memory[category])) {
      throw new Error(
        `NikaConversation: unsupported memory category "${category}"`
      );
    }

    if (index < 0 || index >= memory[category].length) {
      return false;
    }

    memory[category].splice(index, 1);

    return true;
  }

  /**
   * Clear long-term memory.
   *
   * Runtime state and short-term conversation are preserved.
   */
  clearMemory(userId) {
    const id = this.normalizeUserId(userId);

    this.memories.set(id, {
      facts: [],
      preferences: [],
      interactionPreferences: [],
      relationshipNotes: [],
      importantEvents: []
    });

    return true;
  }

  /**
   * Return a safe snapshot of long-term memory.
   */
  getMemorySnapshot(userId) {
    const memory = this.getMemory(userId);

    return {
      facts: [...memory.facts],
      preferences: [...memory.preferences],
      interactionPreferences: [
        ...memory.interactionPreferences
      ],
      relationshipNotes: [
        ...memory.relationshipNotes
      ],
      importantEvents: [
        ...memory.importantEvents
      ]
    };
  }

  /**
   * Build the complete context required by nika.js.
   *
   * This is the primary boundary between the context/memory
   * layer and the Nika runtime.
   */
  buildContext(userId) {
    const state = this.getState(userId);

    return {
      userId: this.normalizeUserId(userId),

      conversation: this.getHistorySnapshot(userId),

      memory: this.getMemorySnapshot(userId),

      state: {
        ...state,
        metadata: {
          ...(state.metadata || {})
        }
      }
    };
  }

  /**
   * Update last activity timestamp.
   */
  touch(userId) {
    return this.updateState(userId, {
      lastActivityAt: Date.now()
    });
  }

  /**
   * Remove all Nika data for a user.
   *
   * This is intentionally explicit and should only be called
   * by an authorized application-level operation.
   */
  deleteUserData(userId) {
    const id = this.normalizeUserId(userId);

    this.conversations.delete(id);
    this.memories.delete(id);
    this.states.delete(id);

    return true;
  }

  /**
   * Diagnostic information.
   */
  getStats(userId) {
    const id = this.normalizeUserId(userId);

    return {
      userId: id,
      conversationMessages:
        this.getHistory(id).length,
      memoryCategories:
        Object.fromEntries(
          Object.entries(this.getMemory(id)).map(
            ([category, values]) => [
              category,
              Array.isArray(values) ? values.length : 0
            ]
          )
        ),
      state: {
        ...this.getState(id)
      }
    };
  }
}

module.exports = NikaConversation;
