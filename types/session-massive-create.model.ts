import { Session } from "./section.model";


export interface SessionMassiveCreate {
	session			: Session;
	dayModuleIds	: number[];
	spaceId			: string;
	professorId		: string | null;
	isEnglish		: boolean;
}
