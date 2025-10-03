'use client'

import { useSearchParams } from "next/navigation";

import { SectionMain }  from "@/components/section/section-main";
import { PageLayout }   from "@/components/layout/page-layout";


export default function SectionsPage() {
    const searchParams = useSearchParams();

	return (
        <PageLayout 
            title="Administrador de Secciones"
        >
            <SectionMain
                enabled         = { true }
                searchParams    = { searchParams }
            />
        </PageLayout>
	);
}
