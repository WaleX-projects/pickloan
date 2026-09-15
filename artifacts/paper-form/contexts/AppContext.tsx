import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type FormStatus =
  | 'LOCAL'
  | 'SYNC_PENDING'
  | 'PROCESSING'
  | 'NEEDS_REVIEW'
  | 'CONFIRMED'
  | 'FAILED';

export type FormFieldKey =
  | 'fullName'
  | 'phoneNumber'
  | 'address'
  | 'dateOfBirth'
  | 'occupation'
  | 'employer'
  | 'monthlyIncome'
  | 'loanAmount'
  | 'loanPurpose'
  | 'repaymentPeriod';

export type ExtractedField = {
  value: string;
  confidence: number;
  sourceText: string;
  required?: boolean;
};

export type FormRecord = {
  id: string;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  documentUri?: string;
  pageCount: number;
  fields: Record<FormFieldKey, ExtractedField>;
};

type AddFormInput = { documentUri?: string; pageCount?: number };

type AppContextValue = {
  forms: FormRecord[];
  hydrated: boolean;
  addForm: (input: AddFormInput) => Promise<FormRecord>;
  updateField: (id: string, key: FormFieldKey, value: string) => Promise<void>;
  confirmForm: (id: string) => Promise<void>;
  retryForm: (id: string) => Promise<void>;
};

const STORAGE_KEY = '@paper-form/forms';
const now = new Date();

const field = (value: string, confidence: number, required = false): ExtractedField => ({
  value,
  confidence,
  sourceText: value,
  required,
});

const blankFields = (): Record<FormFieldKey, ExtractedField> => ({
  fullName: field('', 0, true),
  phoneNumber: field('', 0, true),
  address: field('', 0),
  dateOfBirth: field('', 0),
  occupation: field('', 0),
  employer: field('', 0),
  monthlyIncome: field('', 0),
  loanAmount: field('', 0, true),
  loanPurpose: field('', 0),
  repaymentPeriod: field('', 0),
});

const sampleForm = (
  id: string,
  name: string,
  status: FormStatus,
  createdAt: string,
  overrides: Partial<Record<FormFieldKey, ExtractedField>>,
): FormRecord => ({
  id,
  status,
  createdAt,
  updatedAt: createdAt,
  pageCount: 2,
  fields: { ...blankFields(), ...overrides },
});

const starterForms: FormRecord[] = [
  sampleForm('sample-john', 'John Doe', 'NEEDS_REVIEW', '2026-09-15T09:46:00.000Z', {
    fullName: field('John Doe', 0.97, true),
    phoneNumber: field('080 1234 5678', 0.91, true),
    address: field('12 Allen Avenue, Ikeja', 0.82),
    monthlyIncome: field('₦150,000', 0.61),
    loanAmount: field('₦500,000', 0.96, true),
    loanPurpose: field('Business expansion', 0.89),
  }),
  sampleForm('sample-mary', 'Mary Johnson', 'CONFIRMED', '2026-09-15T09:33:00.000Z', {
    fullName: field('Mary Johnson', 0.98, true),
    phoneNumber: field('080 9876 5432', 0.96, true),
    loanAmount: field('₦250,000', 0.95, true),
  }),
  sampleForm('sample-michael', 'Michael Ade', 'SYNC_PENDING', '2026-09-15T08:40:00.000Z', {
    fullName: field('Michael Ade', 0.99, true),
  }),
];

const AppContext = createContext<AppContextValue | null>(null);

const makeId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [forms, setForms] = useState<FormRecord[]>(starterForms);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setForms(JSON.parse(stored) as FormRecord[]);
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(forms)).catch(() => undefined);
    }
  }, [forms, hydrated]);

  const value = useMemo<AppContextValue>(
    () => ({
      forms,
      hydrated,
      addForm: async ({ documentUri, pageCount = 1 }) => {
        const timestamp = new Date().toISOString();
        const newForm: FormRecord = {
          id: makeId(),
          status: 'SYNC_PENDING',
          createdAt: timestamp,
          updatedAt: timestamp,
          documentUri,
          pageCount,
          fields: blankFields(),
        };
        setForms((current) => [newForm, ...current]);
        return newForm;
      },
      updateField: async (id, key, value) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? {
                  ...form,
                  updatedAt: new Date().toISOString(),
                  fields: {
                    ...form.fields,
                    [key]: {
                      ...form.fields[key],
                      value,
                    },
                  },
                }
              : form,
          ),
        );
      },
      confirmForm: async (id) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? { ...form, status: 'CONFIRMED', updatedAt: new Date().toISOString() }
              : form,
          ),
        );
      },
      retryForm: async (id) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? { ...form, status: 'SYNC_PENDING', updatedAt: new Date().toISOString() }
              : form,
          ),
        );
      },
    }),
    [forms, hydrated],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}