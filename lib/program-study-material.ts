import { prisma } from '@/lib/prisma'

export type StudyMaterialItem = {
  url: string
  fileName: string
}

function normalizeMaterials(raw: unknown): StudyMaterialItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const url = String((item as { url?: unknown }).url || '').trim()
      const fileName = String((item as { fileName?: unknown }).fileName || '').trim()
      if (!url) return null
      return { url, fileName: fileName || 'Study material' }
    })
    .filter((item): item is StudyMaterialItem => item !== null)
}

/**
 * Persist study materials on Program via MongoDB update.
 * Keeps legacy single-file fields in sync with the first item for backward compatibility.
 */
export async function setProgramStudyMaterials(
  programId: string,
  materials: StudyMaterialItem[]
): Promise<void> {
  if (!/^[a-fA-F0-9]{24}$/.test(programId)) {
    throw new Error('Invalid program id')
  }

  const studyMaterials = normalizeMaterials(materials)
  const first = studyMaterials[0] ?? null

  await prisma.$runCommandRaw({
    update: 'programs',
    updates: [
      {
        q: { _id: { $oid: programId } },
        u: {
          $set: {
            studyMaterials,
            studyMaterialUrl: first?.url ?? null,
            studyMaterialFileName: first?.fileName ?? null,
          },
        },
      },
    ],
  })
}

/** @deprecated Prefer setProgramStudyMaterials */
export async function setProgramStudyMaterial(
  programId: string,
  studyMaterialUrl: string | null,
  studyMaterialFileName: string | null
): Promise<void> {
  const materials =
    studyMaterialUrl
      ? [{ url: studyMaterialUrl, fileName: studyMaterialFileName || 'Study material' }]
      : []
  await setProgramStudyMaterials(programId, materials)
}

/**
 * Read study materials for a program.
 * Falls back to legacy single-file fields when the array is empty.
 */
export async function getProgramStudyMaterial(programId: string): Promise<{
  studyMaterials: StudyMaterialItem[]
  studyMaterialUrl: string | null
  studyMaterialFileName: string | null
}> {
  if (!/^[a-fA-F0-9]{24}$/.test(programId)) {
    return { studyMaterials: [], studyMaterialUrl: null, studyMaterialFileName: null }
  }

  const result = (await prisma.$runCommandRaw({
    find: 'programs',
    filter: { _id: { $oid: programId } },
    projection: {
      studyMaterials: 1,
      studyMaterialUrl: 1,
      studyMaterialFileName: 1,
    },
    limit: 1,
  })) as {
    cursor?: {
      firstBatch?: Array<{
        studyMaterials?: unknown
        studyMaterialUrl?: string | null
        studyMaterialFileName?: string | null
      }>
    }
  }

  const doc = result?.cursor?.firstBatch?.[0]
  let studyMaterials = normalizeMaterials(doc?.studyMaterials)

  // Backward compatibility: promote legacy single file into the array
  if (
    studyMaterials.length === 0 &&
    doc?.studyMaterialUrl
  ) {
    studyMaterials = [
      {
        url: doc.studyMaterialUrl,
        fileName: doc.studyMaterialFileName || 'Study material',
      },
    ]
  }

  const first = studyMaterials[0] ?? null
  return {
    studyMaterials,
    studyMaterialUrl: first?.url ?? null,
    studyMaterialFileName: first?.fileName ?? null,
  }
}
