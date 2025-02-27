import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import type { User, LiveObject } from '@liveblocks/client';
import { useCallback } from 'react';

export type Presence = {
  currentPage: string;
  isActive: boolean;
  lastActiveAt: string;
  userId: string;
  username: string;
  currentAction?: {
    type: 'viewing' | 'attempting_quiz' | 'completed_quiz';
    resourceId?: string;
    startedAt: string;
  };
};
type Storage = {
  userSessions: LiveObject<{
    [key: string]: {
      connectionId: string;
      lastPageVisit: string;
      sessionStartedAt: string;
    };
  }>;
};
type LiveblockUser = User<Presence, {}>;

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
  const updatePresence = useUpdateMyPresence();

  const updateUserActivity = useCallback((
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
  }, [updatePresence, userId, username]);

  const trackQuizAttempt = useCallback((quizId: string, action: 'attempting_quiz' | 'completed_quiz') => {
    updatePresence({
      currentAction: {
        type: action,
        resourceId: quizId,
        startedAt: new Date().toISOString(),
      },
    });
  }, [updatePresence]);

  return {
    updateUserActivity,
    trackQuizAttempt,
  };
};

// Admin monitoring hook
export const useAdminMonitor = () => {
  const others = useOthers();

  const getActiveUsers = useCallback(() => {
    return Array.from(others).filter((user: LiveblockUser) => user.presence?.isActive);
  }, [others]);

  const getUsersByPage = useCallback(() => {
    const pageMap = new Map<string, Presence[]>();
    Array.from(others).forEach((other: LiveblockUser) => {
      if (other.presence) {
        const page = other.presence.currentPage;
        if (!pageMap.has(page)) {
          pageMap.set(page, []);
        }
        const users = pageMap.get(page);
        if (users) {
          users.push(other.presence);
        }
      }
    });
    return pageMap;
  }, [others]);

  const getQuizActivity = useCallback(() => {
    return Array.from(others)
      .filter((user: LiveblockUser) =>
        user.presence?.currentAction?.type.includes('quiz')
      )
      .map((user: LiveblockUser) => ({
        userId: user.presence?.userId,
        username: user.presence?.username,
        action: user.presence?.currentAction,
      }));
  }, [others]);

  return {
    getActiveUsers,
    getUsersByPage,
    getQuizActivity,
  };
};