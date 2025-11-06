'use client'

import { JSX }                      from "react";

import { PageLayout }               from "@/components/layout/page-layout";
import { RequestsManagement }       from "@/components/request/request-management";


/**
 * Global Requests Page
 * Shows all requests from all faculties
 */
export default function RequestsPage(): JSX.Element {
	return (
		<PageLayout title="Solicitudes">
			<RequestsManagement
				enabled = { true }
			/>
		</PageLayout>
	);
}
