import { Session } from "@/types/section.model";

export const sessionLabels = {
    [Session.C]: 'Cátedra',
    [Session.A]: 'Ayudantía',
    [Session.T]: 'Taller',
    [Session.L]: 'Laboratorio',
};

export const sessionColors = {
    [Session.C]: 'bg-blue-500',
    [Session.A]: 'bg-green-500',
    [Session.T]: 'bg-orange-500',
    [Session.L]: 'bg-purple-500',
};
