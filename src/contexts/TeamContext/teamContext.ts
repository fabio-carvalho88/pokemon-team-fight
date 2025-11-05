import { createContext } from 'react';
import { type TeamContextType } from '../../types/team';

export const TeamContext = createContext<TeamContextType | undefined>(undefined);
