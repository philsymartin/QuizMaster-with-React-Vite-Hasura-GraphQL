// services/liveblocks.ts
import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import type { BaseUserMeta, User, LiveObject } from '@liveblocks/client';

// Types for user presence
export type Presence = {
  currentPage: string;
  isActive: boolean;
  lastActiveAt: string;
  userId: string;
  username: string;
  currentAction?: {
    type: 'viewing' | 'attempting_quiz' | 'completed_quiz' | 'idle';
    resourceId?: string;
    startedAt: string;
  };
};

// Types for user storage
type Storage = {
  userSessions: LiveObject<{
    [key: string]: {
      connectionId: string;
      lastPageVisit: string;
      sessionStartedAt: string;
    };
  }>;
};

// Type for Other Users
type LiveblockUser = User<Presence, BaseUserMeta>;

// Initialize Liveblocks client
export const client = createClient({
  publicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string,
  throttle: 100,
});

// Create room context with types
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useSelf,
} = createRoomContext<Presence, Storage>(client);

// Room creation helper
export const getRoomId = (type: 'admin' | 'quiz', id?: string) => {
  switch (type) {
    case 'admin':
      return 'admin-dashboard';
    case 'quiz':
      return `quiz-${id}`;
    default:
      return 'general';
  }
};

// Custom hooks for user tracking
export const useUserTracker = (userId: string, username: string) => {
  const [presence, updatePresence] = useMyPresence();

  const updateUserActivity = (
    currentPage: string,
    action?: Presence['currentAction']
  ) => {
    updatePresence({
      currentPage,
      isActive: true,
      lastActiveAt: new Date().toISOString(),
      userId,
      username,
      currentAction: action || {
        type: 'viewing',
        startedAt: new Date().toISOString(),
      },
    });
  };

  const markUserIdle = () => {
    updatePresence({
      ...presence,
      isActive: false,
      currentAction: {
        type: 'idle',
        startedAt: new Date().toISOString(),
      },
    });
  };

  const trackQuizAttempt = (quizId: string, action: 'attempting_quiz' | 'completed_quiz') => {
    updatePresence({
      ...presence,
      currentAction: {
        type: action,
        resourceId: quizId,
        startedAt: new Date().toISOString(),
      },
    });
  };

  return {
    updateUserActivity,
    markUserIdle,
    trackQuizAttempt,
  };
};

// Admin monitoring hook
export const useAdminMonitor = () => {
  const others = useOthers();

  const getActiveUsers = () => {
    return Array.from(others).filter((user: LiveblockUser) => user.presence?.isActive);
  };

  const getUsersByPage = () => {
    const pageMap = new Map<string, Array<Presence>>();

    Array.from(others).forEach((other: LiveblockUser) => {
      if (other.presence) {
        const page = other.presence.currentPage;
        if (!pageMap.has(page)) {
          pageMap.set(page, []);
        }
        pageMap.get(page)?.push(other.presence);
      }
    });

    return pageMap;
  };

  const getQuizActivity = () => {
    return Array.from(others)
      .filter((user: LiveblockUser) =>
        user.presence?.currentAction?.type.includes('quiz')
      )
      .map((user: LiveblockUser) => ({
        userId: user.presence?.userId,
        username: user.presence?.username,
        action: user.presence?.currentAction,
      }));
  };

  return {
    getActiveUsers,
    getUsersByPage,
    getQuizActivity,
  };
};