import 'server-only'; // Ensure server-only is imported first

import { SITE } from '@/lib/site';
import { db } from '../config';

const COLLECTION = 'projects';
const FOOTER_PROJECT_LIMIT = 3;

export interface FooterProjectLink {
  name: string;
  href: string;
}

type RawFooterProject = {
  id?: unknown;
  name?: unknown;
  createdAt?: unknown;
};

function getProjectId(raw: RawFooterProject, documentId: string): string {
  return typeof raw.id === 'string' && raw.id.trim().length > 0
    ? raw.id
    : documentId;
}

function getCreatedAtMillis(value: unknown): number {
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toMillis?: unknown }).toMillis === 'function'
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }

  return 0;
}

export async function getFooterProjects(): Promise<FooterProjectLink[]> {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where('showProject', '==', true)
      .get();

    return snapshot.docs
      .flatMap(doc => {
        const raw = doc.data() as RawFooterProject;
        if (typeof raw.name !== 'string' || raw.name.trim().length === 0) {
          return [];
        }

        const id = getProjectId(raw, doc.id);

        return [
          {
            name: raw.name.trim(),
            href: `${SITE.mainSite}/proyectos/${id}`,
            createdAt: getCreatedAtMillis(raw.createdAt),
          },
        ];
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, FOOTER_PROJECT_LIMIT)
      .map(({ name, href }) => ({ name, href }));
  } catch (err) {
    console.error('[getFooterProjects] Error:', err);
    return [];
  }
}
