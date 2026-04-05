import { useEffect, useMemo, useState } from 'react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type Attributes = Record<string, string>;

const EDITABLE_FIELDS: string[] = [
  'given_name',
  'family_name',
  'name',
  'email',
  'phone_number',
  'preferred_username',
  'nickname',
  'middle_name',
  'profile',
  'picture',
  'website',
  'locale',
  'zoneinfo',
  'gender',
  'birthdate',
  'address'
];

const NON_EDITABLE_FIELDS = new Set<string>([
  'sub',
  'email_verified',
  'phone_number_verified',
  'identities',
  'custom:organization'
]);

function toLabel(attribute: string): string {
  if (attribute === 'custom:organization') return 'Organization';
  return attribute
    .replace(/^custom:/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function Settings() {
  const [initialEditableValues, setInitialEditableValues] = useState<Attributes>({});
  const [editableValues, setEditableValues] = useState<Attributes>({});
  const [nonEditableValues, setNonEditableValues] = useState<Attributes>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAttributes() {
      setLoading(true);
      try {
        const attributes = await fetchUserAttributes();
        const withOrganization: Attributes = {
          ...attributes,
          'custom:organization': attributes['custom:organization'] ?? ''
        };

        const nextEditable: Attributes = {};
        for (const field of EDITABLE_FIELDS) {
          nextEditable[field] = withOrganization[field] ?? '';
        }

        const nextNonEditable: Attributes = {};
        Object.entries(withOrganization).forEach(([key, value]) => {
          if (!EDITABLE_FIELDS.includes(key) || NON_EDITABLE_FIELDS.has(key)) {
            nextNonEditable[key] = value ?? '';
          }
        });

        if (!('custom:organization' in nextNonEditable)) {
          nextNonEditable['custom:organization'] = '';
        }

        setInitialEditableValues(nextEditable);
        setEditableValues(nextEditable);
        setNonEditableValues(nextNonEditable);
      } catch (error) {
        console.error('Failed to load user attributes', error);
        toast.error('Failed to load your user information.');
      } finally {
        setLoading(false);
      }
    }

    loadAttributes();
  }, []);

  const changedAttributes = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(editableValues).filter(
          ([key, value]) =>
            value !== initialEditableValues[key] && value.trim() !== ''
        )
      ),
    [editableValues, initialEditableValues]
  );

  const hasChanges = useMemo(
    () =>
      Object.keys(changedAttributes).length > 0,
    [changedAttributes]
  );

  const sortedNonEditableEntries = useMemo(
    () =>
      Object.entries(nonEditableValues).sort(([firstKey], [secondKey]) => {
        if (firstKey === 'custom:organization') return 1;
        if (secondKey === 'custom:organization') return -1;
        return firstKey.localeCompare(secondKey);
      }),
    [nonEditableValues]
  );

  const handleEditableChange = (field: string, value: string) => {
    setEditableValues((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (Object.keys(changedAttributes).length === 0) {
      toast.message('No changes to save.');
      return;
    }

    setSaving(true);
    try {
      await updateUserAttributes({ userAttributes: changedAttributes });
      setInitialEditableValues((current) => ({
        ...current,
        ...changedAttributes
      }));
      toast.success('User information updated.');
    } catch (error) {
      console.error('Failed to update user attributes', error);
      toast.error('Failed to update user information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your AWS user profile information.
        </p>

        {loading ? (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Loading user information...
          </div>
        ) : (
          <div className="mt-6 space-y-8 rounded-xl border border-gray-200 bg-white p-6">
            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">
                Editable Fields
              </h3>
              {EDITABLE_FIELDS.map((field) => (
                <div className="space-y-2" key={field}>
                  <Label htmlFor={`editable-${field}`}>{toLabel(field)}</Label>
                  <Input
                    id={`editable-${field}`}
                    value={editableValues[field] ?? ''}
                    onChange={(event) =>
                      handleEditableChange(field, event.target.value)
                    }
                    disabled={saving}
                  />
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">
                Non-Editable Fields
              </h3>
              {sortedNonEditableEntries.map(([field, value]) => (
                <div className="space-y-2" key={field}>
                  <Label htmlFor={`readonly-${field}`}>{toLabel(field)}</Label>
                  <Input
                    id={`readonly-${field}`}
                    value={value}
                    readOnly
                    disabled
                    className="bg-gray-100 text-gray-700"
                  />
                </div>
              ))}
            </section>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={!hasChanges || saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
