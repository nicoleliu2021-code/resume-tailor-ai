import type {
  ResumeVersion,
  VersionComparison,
  VersionStats,
  VersionFilters,
  VersionHistoryEntry,
} from '../types/resumeVersion';
import type { StructuredResume } from '../types/resume';

const STORAGE_KEY = 'resume_versions_v1';
const HISTORY_KEY = 'version_history_v1';

/**
 * Resume Version Service
 * Manage tailored resume versions for different jobs
 */

// ============================================================================
// CRUD Operations
// ============================================================================

export function getAllVersions(): ResumeVersion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const versions = JSON.parse(stored);

    // Parse dates
    return versions.map((version: any) => ({
      ...version,
      createdAt: new Date(version.createdAt),
      updatedAt: new Date(version.updatedAt),
      lastExportedAt: version.lastExportedAt ? new Date(version.lastExportedAt) : undefined,
    }));
  } catch (error) {
    console.error('[Versions] Error loading versions:', error);
    return [];
  }
}

export function getVersion(id: string): ResumeVersion | null {
  const versions = getAllVersions();
  return versions.find((v) => v.id === id) || null;
}

export function saveVersion(version: ResumeVersion): void {
  try {
    const versions = getAllVersions();
    const existingIndex = versions.findIndex((v) => v.id === version.id);

    if (existingIndex >= 0) {
      versions[existingIndex] = { ...version, updatedAt: new Date() };
      addHistoryEntry({
        id: generateId(),
        versionId: version.id,
        action: 'updated',
        description: `Updated version "${version.name}"`,
        timestamp: new Date(),
      });
    } else {
      version.createdAt = new Date();
      version.updatedAt = new Date();
      versions.push(version);
      addHistoryEntry({
        id: generateId(),
        versionId: version.id,
        action: 'created',
        description: `Created version "${version.name}"`,
        timestamp: new Date(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
    console.log('[Versions] Version saved:', version.name);
  } catch (error) {
    console.error('[Versions] Error saving version:', error);
    throw new Error('Failed to save version');
  }
}

export function updateVersion(id: string, updates: Partial<ResumeVersion>): void {
  const version = getVersion(id);
  if (!version) throw new Error('Version not found');

  const updated = { ...version, ...updates, updatedAt: new Date() };
  saveVersion(updated);
}

export function deleteVersion(id: string): void {
  try {
    const versions = getAllVersions();
    const filtered = versions.filter((v) => v.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    addHistoryEntry({
      id: generateId(),
      versionId: id,
      action: 'updated',
      description: `Deleted version`,
      timestamp: new Date(),
    });

    console.log('[Versions] Version deleted:', id);
  } catch (error) {
    console.error('[Versions] Error deleting version:', error);
    throw new Error('Failed to delete version');
  }
}

export function duplicateVersion(id: string, newName: string): ResumeVersion {
  const original = getVersion(id);
  if (!original) throw new Error('Version not found');

  const duplicate: ResumeVersion = {
    ...original,
    id: generateId(),
    name: newName,
    slug: slugify(newName),
    version: 1,
    parentVersionId: id,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastExportedAt: undefined,
    exportCount: 0,
    viewCount: 0,
    status: 'draft',
    applicationId: undefined,
  };

  saveVersion(duplicate);

  addHistoryEntry({
    id: generateId(),
    versionId: duplicate.id,
    action: 'duplicated',
    description: `Duplicated from "${original.name}"`,
    timestamp: new Date(),
  });

  return duplicate;
}

// ============================================================================
// Query Operations
// ============================================================================

export function getVersionsByStatus(status: ResumeVersion['status']): ResumeVersion[] {
  return getAllVersions().filter((v) => v.status === status);
}

export function searchVersions(query: string): ResumeVersion[] {
  const lowerQuery = query.toLowerCase();
  return getAllVersions().filter(
    (v) =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.targetRole.toLowerCase().includes(lowerQuery) ||
      v.targetCompany?.toLowerCase().includes(lowerQuery) ||
      v.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function filterVersions(filters: VersionFilters): ResumeVersion[] {
  let versions = getAllVersions();

  if (filters.searchQuery) {
    versions = searchVersions(filters.searchQuery);
  }

  if (filters.status && filters.status.length > 0) {
    versions = versions.filter((v) => filters.status!.includes(v.status));
  }

  if (filters.tags && filters.tags.length > 0) {
    versions = versions.filter((v) => filters.tags!.some((tag) => v.tags.includes(tag)));
  }

  if (filters.targetRoles && filters.targetRoles.length > 0) {
    versions = versions.filter((v) => filters.targetRoles!.some((role) => v.targetRole.toLowerCase().includes(role.toLowerCase())));
  }

  if (filters.companies && filters.companies.length > 0) {
    versions = versions.filter((v) => v.targetCompany && filters.companies!.some((company) => v.targetCompany!.toLowerCase().includes(company.toLowerCase())));
  }

  if (filters.minMatchScore) {
    versions = versions.filter((v) => v.matchScore && v.matchScore >= filters.minMatchScore!);
  }

  if (filters.hasApplication !== undefined) {
    versions = versions.filter((v) => (filters.hasApplication ? !!v.applicationId : !v.applicationId));
  }

  if (filters.dateRange) {
    versions = versions.filter(
      (v) => v.createdAt >= filters.dateRange!.start && v.createdAt <= filters.dateRange!.end
    );
  }

  return versions;
}

export function getRecentVersions(limit: number = 5): ResumeVersion[] {
  return getAllVersions()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

// ============================================================================
// Comparison
// ============================================================================

export function compareVersions(id1: string, id2: string): VersionComparison {
  const version1 = getVersion(id1);
  const version2 = getVersion(id2);

  if (!version1 || !version2) {
    throw new Error('One or both versions not found');
  }

  // Compare experiences
  const exp1Set = new Set(version1.selectedExperienceIds);
  const exp2Set = new Set(version2.selectedExperienceIds);
  const expAdded = version2.selectedExperienceIds.filter((id) => !exp1Set.has(id));
  const expRemoved = version1.selectedExperienceIds.filter((id) => !exp2Set.has(id));
  const expCommon = version1.selectedExperienceIds.filter((id) => exp2Set.has(id));

  // Compare achievements
  const ach1Set = new Set(version1.selectedAchievementIds);
  const ach2Set = new Set(version2.selectedAchievementIds);
  const achAdded = version2.selectedAchievementIds.filter((id) => !ach1Set.has(id));
  const achRemoved = version1.selectedAchievementIds.filter((id) => !ach2Set.has(id));
  const achCommon = version1.selectedAchievementIds.filter((id) => ach2Set.has(id));

  // Compare skills
  const skill1Set = new Set(version1.selectedSkillIds);
  const skill2Set = new Set(version2.selectedSkillIds);
  const skillAdded = version2.selectedSkillIds.filter((id) => !skill1Set.has(id));
  const skillRemoved = version1.selectedSkillIds.filter((id) => !skill2Set.has(id));
  const skillCommon = version1.selectedSkillIds.filter((id) => skill2Set.has(id));

  // Compare projects
  const proj1Set = new Set(version1.selectedProjectIds);
  const proj2Set = new Set(version2.selectedProjectIds);
  const projAdded = version2.selectedProjectIds.filter((id) => !proj1Set.has(id));
  const projRemoved = version1.selectedProjectIds.filter((id) => !proj2Set.has(id));

  // Calculate similarity
  const totalElements = exp1Set.size + exp2Set.size + ach1Set.size + ach2Set.size + skill1Set.size + skill2Set.size;
  const commonElements = expCommon.length + achCommon.length + skillCommon.length;
  const similarity = totalElements > 0 ? Math.round((commonElements * 2 / totalElements) * 100) : 0;

  return {
    version1,
    version2,
    differences: {
      experiences: {
        added: expAdded,
        removed: expRemoved,
        common: expCommon,
      },
      achievements: {
        added: achAdded.map((id) => ({ experienceId: '', achievementId: id, text: '' })),
        removed: achRemoved.map((id) => ({ experienceId: '', achievementId: id, text: '' })),
        common: achCommon,
      },
      skills: {
        added: skillAdded,
        removed: skillRemoved,
        common: skillCommon,
      },
      projects: {
        added: projAdded,
        removed: projRemoved,
      },
      summary: {
        changed: version1.optimizedContent.summary !== version2.optimizedContent.summary,
      },
    },
    similarity,
    recommendation: generateComparisonRecommendation(version1, version2, similarity),
  };
}

function generateComparisonRecommendation(v1: ResumeVersion, v2: ResumeVersion, similarity: number): string {
  if (similarity > 80) {
    return 'These versions are very similar. Consider using the one with the higher match score or more recent optimizations.';
  }

  if (v1.targetCompany && v2.targetCompany && v1.targetCompany !== v2.targetCompany) {
    return `Use "${v1.name}" for ${v1.targetCompany} and "${v2.name}" for ${v2.targetCompany}.`;
  }

  if (v1.matchScore && v2.matchScore) {
    const higher = v1.matchScore > v2.matchScore ? v1 : v2;
    return `"${higher.name}" has a higher match score (${higher.matchScore}%). Use it for stronger applications.`;
  }

  return 'These versions target different roles. Choose based on the specific job requirements.';
}

// ============================================================================
// Application Integration
// ============================================================================

export function linkToApplication(versionId: string, applicationId: string): void {
  updateVersion(versionId, { applicationId, status: 'applied' });

  addHistoryEntry({
    id: generateId(),
    versionId,
    action: 'applied',
    description: `Linked to application ${applicationId}`,
    timestamp: new Date(),
  });
}

export function getVersionForApplication(applicationId: string): ResumeVersion | null {
  return getAllVersions().find((v) => v.applicationId === applicationId) || null;
}

export function incrementExportCount(versionId: string): void {
  const version = getVersion(versionId);
  if (!version) return;

  updateVersion(versionId, {
    exportCount: version.exportCount + 1,
    lastExportedAt: new Date(),
    status: 'exported',
  });

  addHistoryEntry({
    id: generateId(),
    versionId,
    action: 'exported',
    description: `Exported resume (${version.exportCount + 1}x total)`,
    timestamp: new Date(),
  });
}

export function incrementViewCount(versionId: string): void {
  const version = getVersion(versionId);
  if (!version) return;

  updateVersion(versionId, {
    viewCount: version.viewCount + 1,
  });
}

// ============================================================================
// Stats & Analytics
// ============================================================================

export function getVersionStats(): VersionStats {
  const versions = getAllVersions();

  if (versions.length === 0) {
    return {
      total: 0,
      byStatus: { draft: 0, optimized: 0, exported: 0, applied: 0, archived: 0 },
      mostRecentVersion: null,
      mostExportedVersion: null,
      highestMatchScore: null,
      averageMatchScore: 0,
      totalExports: 0,
      totalApplications: 0,
    };
  }

  const byStatus = versions.reduce(
    (acc, v) => {
      acc[v.status]++;
      return acc;
    },
    { draft: 0, optimized: 0, exported: 0, applied: 0, archived: 0 }
  );

  const mostRecent = versions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
  const mostExported = versions.sort((a, b) => b.exportCount - a.exportCount)[0];
  const highestMatch = versions
    .filter((v) => v.matchScore !== undefined)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0];

  const versionsWithScore = versions.filter((v) => v.matchScore !== undefined);
  const averageMatchScore =
    versionsWithScore.length > 0
      ? versionsWithScore.reduce((sum, v) => sum + (v.matchScore || 0), 0) / versionsWithScore.length
      : 0;

  const totalExports = versions.reduce((sum, v) => sum + v.exportCount, 0);
  const totalApplications = versions.filter((v) => v.applicationId).length;

  return {
    total: versions.length,
    byStatus,
    mostRecentVersion: mostRecent,
    mostExportedVersion: mostExported,
    highestMatchScore: highestMatch || null,
    averageMatchScore: Math.round(averageMatchScore),
    totalExports,
    totalApplications,
  };
}

export function getVersionHistory(versionId: string): VersionHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    return history
      .filter((entry: any) => entry.versionId === versionId)
      .map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }))
      .sort((a: VersionHistoryEntry, b: VersionHistoryEntry) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('[Versions] Error loading history:', error);
    return [];
  }
}

function addHistoryEntry(entry: VersionHistoryEntry): void {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    const history = stored ? JSON.parse(stored) : [];
    history.push(entry);

    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('[Versions] Error saving history:', error);
  }
}

// ============================================================================
// Utilities
// ============================================================================

export function getAllTags(): string[] {
  const allTags = getAllVersions().flatMap((v) => v.tags);
  return Array.from(new Set(allTags)).sort();
}

export function getAllTargetRoles(): string[] {
  const roles = getAllVersions().map((v) => v.targetRole);
  return Array.from(new Set(roles)).sort();
}

export function getAllTargetCompanies(): string[] {
  const companies = getAllVersions()
    .map((v) => v.targetCompany)
    .filter((c): c is string => !!c);
  return Array.from(new Set(companies)).sort();
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// Create Version Helper
// ============================================================================

export function createVersionFromSelection(data: {
  name: string;
  targetRole: string;
  targetCompany?: string;
  selectedExperienceIds: string[];
  selectedAchievementIds: string[];
  selectedSkillIds: string[];
  selectedProjectIds: string[];
  optimizedContent: StructuredResume;
  jobDescription?: string;
  jobUrl?: string;
  matchScore?: number;
  tags?: string[];
}): ResumeVersion {
  const version: ResumeVersion = {
    id: generateId(),
    name: data.name,
    slug: slugify(data.name),
    targetRole: data.targetRole,
    targetCompany: data.targetCompany,
    selectedExperienceIds: data.selectedExperienceIds,
    selectedAchievementIds: data.selectedAchievementIds,
    selectedSkillIds: data.selectedSkillIds,
    selectedProjectIds: data.selectedProjectIds,
    optimizedContent: data.optimizedContent,
    jobDescription: data.jobDescription,
    jobUrl: data.jobUrl,
    matchScore: data.matchScore,
    tags: data.tags || [],
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    exportCount: 0,
    viewCount: 0,
    status: 'optimized',
  };

  saveVersion(version);
  return version;
}
