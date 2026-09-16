
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {extractFormFields} from './AiContext';

export type FormStatus =
  | 'LOCAL'
  | 'PROCESSING'
  | 'NEEDS_REVIEW'
  | 'CONFIRMED'
  | 'FAILED'
  | 'SYNC_PENDING';

export type FormFieldKey =
  // Section 1: Personal Information
  | 'fullName'
  | 'dateOfBirth'
  | 'gender'
  | 'maritalStatus'
  | 'emailAddress'
  | 'phoneNumber'
  | 'residentialAddress'
  | 'idType'
  | 'idNumber'
  
  // Section 2: Employment & Financial Details
  | 'currentEmployer'
  | 'jobTitle'
  | 'monthlyNetIncome'
  | 'otherIncomeSource'
  | 'workAddress'
  
  // Section 3: Loan Request Details
  | 'requestedAmount'
  | 'loanTenure'
  | 'purposeOfLoan'
  | 'bankName'
  | 'accountNumber';

  
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

  // Optional AI progress information
  aiProgress?: number;
  aiMessage?: string;

  fields: Record<FormFieldKey, ExtractedField>;
};

type AddFormInput = {
  documentUri?: string;
  pageCount?: number;
};

type AppContextValue = {
  forms: FormRecord[];
  hydrated: boolean;

  addForm: (input: AddFormInput) => Promise<FormRecord>;

  updateField: (
    id: string,
    key: FormFieldKey,
    value: string,
  ) => Promise<void>;

  updateAIStatus: (
    id: string,
    progress: number,
    message?: string,
  ) => Promise<void>;

  finishAIProcessing: (
    id: string,
    fields: Partial<Record<FormFieldKey, ExtractedField>>,
  ) => Promise<void>;

  failAIProcessing: (
    id: string,
    message?: string,
  ) => Promise<void>;

  confirmForm: (id: string) => Promise<void>;

  retryForm: (id: string) => Promise<void>;
};

const STORAGE_KEY = '@paper-form/forms';

const field = (
  value: string,
  confidence: number,
  required = false,
): ExtractedField => ({
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
  status: FormStatus,
  createdAt: string,
  overrides: Partial<Record<FormFieldKey, ExtractedField>>,
): FormRecord => ({
  id,
  status,
  createdAt,
  updatedAt: createdAt,
  pageCount: 2,
  fields: {
    ...blankFields(),
    ...overrides,
  },
});


const AppContext = createContext<AppContextValue | null>(null);

const makeId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [forms, setForms] = useState<FormRecord[]>();
  const [hydrated, setHydrated] = useState(false);

const runExtraction = async (image) => {
  const extractFormFields = await extractFormFields(image)
}


  /*
   * Load forms from local storage
   */
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

  /*
   * Persist forms
   */
  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(forms),
      ).catch(() => undefined);
    }
  }, [forms, hydrated]);

  const value = useMemo<AppContextValue>(
    () => ({
      forms,
      hydrated,

      /*
       * Create a new form.
       *
       * We start with PROCESSING because the next step
       * is AI document extraction.
       */
      addForm: async ({
        documentUri,
        pageCount = 1,
      }) => {
        const timestamp = new Date().toISOString();

        const newForm: FormRecord = {
          id: makeId(),

          status: 'PROCESSING',

          createdAt: timestamp,
          updatedAt: timestamp,

          documentUri,
          pageCount,

          aiProgress: 0,
          aiMessage: 'Preparing document...',

          fields: blankFields(),
        };

        setForms((current) => [
          newForm,
          ...current,
        ]);
      runExtraction(newForm)
        return newForm;
      },

      /*
       * Update a normal form field.
       */
      updateField: async (
        id,
        key,
        value,
      ) => {
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

      /*
       * Update AI generation/extraction progress.
       *
       * Example:
       *
       * 20% - Reading document
       * 50% - Extracting fields
       * 80% - Checking extracted information
       */
      updateAIStatus: async (
        id,
        progress,
        message,
      ) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? {
                  ...form,

                  status: 'PROCESSING',

                  aiProgress: Math.min(
                    100,
                    Math.max(0, progress),
                  ),

                  aiMessage: message,

                  updatedAt: new Date().toISOString(),
                }
              : form,
          ),
        );
      },

      /*
       * AI finished extracting the document.
       *
       * The form now waits for a human to review it.
       */
      finishAIProcessing: async (
        id,
        extractedFields,
      ) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? {
                  ...form,

                  status: 'NEEDS_REVIEW',

                  aiProgress: 100,

                  aiMessage: 'AI extraction complete',

                  updatedAt: new Date().toISOString(),

                  fields: {
                    ...form.fields,
                    ...extractedFields,
                  },
                }
              : form,
          ),
        );
      },

      /*
       * AI failed.
       */
      failAIProcessing: async (
        id,
        message = 'AI processing failed',
      ) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? {
                  ...form,

                  status: 'FAILED',

                  aiMessage: message,

                  updatedAt: new Date().toISOString(),
                }
              : form,
          ),
        );
      },

      /*
       * Human confirms the AI-generated form.
       */
      confirmForm: async (id) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? {
                  ...form,

                  status: 'CONFIRMED',

                  updatedAt: new Date().toISOString(),
                }
              : form,
          ),
        );
      },

      /*
       * Retry AI processing.
       */
      retryForm: async (id) => {
        setForms((current) =>
          current.map((form) =>
            form.id === id
              ? {
                  ...form,

                  status: 'PROCESSING',

                  aiProgress: 0,

                  aiMessage: 'Starting AI processing...',

                  updatedAt: new Date().toISOString(),
                }
              : form,
          ),
        );
      },
    }),
    [forms, hydrated],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used inside AppProvider',
    );
  }

  return context;
}

