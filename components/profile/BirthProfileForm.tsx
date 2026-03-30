"use client";

/**
 * FE-11 thin wrapper — same as BirthDataForm with naming aligned to spec.
 */
import { BirthDataForm, type BirthDataValues } from "@/components/onboarding/BirthDataForm";

export interface BirthProfileFormValues extends BirthDataValues {
  cityLabel?: string;
  hasVedicChart?: boolean;
}

interface Props {
  existing: BirthProfileFormValues | null;
  onSuccess: () => void;
}

export function BirthProfileForm({ existing, onSuccess }: Props) {
  return (
    <BirthDataForm
      initialValues={existing ?? undefined}
      isEdit={existing !== null}
      hasVedicChart={existing?.hasVedicChart}
      onSuccess={onSuccess}
    />
  );
}
