'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../components/AuthContext';
import { useGeocode } from '../../../../lib/hooks/useGeocode';
import { useLocations } from '../../../../lib/hooks/useLocations';
import styles from '../../../../components/admin/Admin.module.css';

export default function NewLocationPage() {
  const { status, role } = useAuth();
  const router = useRouter();
  const { geocode } = useGeocode();
  const { locations, isLoading, mutate } = useLocations();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('pollution');
  const [coordinates, setCoordinates] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && role !== 'ADMIN' && role !== 'ADMIN_ASSISTANT') {
      router.replace('/login');
    }
  }, [router, role, status]);

  const recentLocations = useMemo(() => locations.slice(0, 8), [locations]);

  async function handleGeocode() {
    if (!address.trim()) {
      setMessage('Enter an address first.');
      return;
    }

    setIsGeocoding(true);
    setMessage('');
    try {
      const result = await geocode(address);
      setCoordinates(result);
      setAddress(result.formattedAddress || address);
    } catch (error) {
      setMessage(error.message || 'Address not found.');
    } finally {
      setIsGeocoding(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!coordinates) {
      setMessage('Get coordinates before saving.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          lat: coordinates.lat,
          lng: coordinates.lng,
          type,
          isActive: true,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to save location.');
      }

      setName('');
      setAddress('');
      setCoordinates(null);
      setType('pollution');
      setMessage('Location saved.');
      mutate();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <div className={styles.centerNotice}>Loading...</div>;
  }

  return (
    <div className={`admin-dashboard ${styles.dashboardShell}`}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Location Manager</h1>
          <p className={styles.dashboardSubtitle}>Use Google Geocoding to create precise map points.</p>
        </div>
        <div className={styles.dashboardHeaderActions}>
          <button type="button" className={styles.secondaryPill} onClick={() => router.push('/admin/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {message ? <div className={styles.inlineAlert}>{message}</div> : null}

      <div className={styles.splitGrid}>
        <form className="admin-card" onSubmit={handleSubmit}>
          <h3>New Location</h3>

          <div className={styles.field}>
            <label>Name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Furtick Farms" />
          </div>

          <div className={styles.field} style={{ marginTop: 12 }}>
            <label>Address</label>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="200 E Wyoming Ave, Philadelphia, PA"
            />
          </div>

          <div className={styles.buttonRow} style={{ marginTop: 12 }}>
            <button type="button" className={styles.primaryAction} onClick={handleGeocode} disabled={isGeocoding}>
              {isGeocoding ? 'Geocoding...' : 'Get Coordinates'}
            </button>
          </div>

          <div className={styles.field} style={{ marginTop: 12 }}>
            <label>Type</label>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="pollution">Pollution</option>
              <option value="solution">Solution</option>
            </select>
          </div>

          {coordinates ? (
            <div style={{ marginTop: 12, color: '#cfd3e6' }}>
              Lat: {coordinates.lat}, Lng: {coordinates.lng}
            </div>
          ) : null}

          <div className={styles.buttonRow} style={{ marginTop: 16 }}>
            <button type="submit" className={styles.successPill} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>

        <div className="admin-card">
          <h3>Recent Active Locations</h3>
          {isLoading ? <p>Loading locations...</p> : null}
          {!isLoading && recentLocations.length === 0 ? <p>No locations saved yet.</p> : null}
          {!isLoading
            ? recentLocations.map((location) => (
                <div key={location.id} style={{ padding: '10px 0', borderBottom: '1px solid #3a3f58' }}>
                  <strong>{location.name}</strong>
                  <p>{location.address}</p>
                  <small>
                    {location.type} · {location.lat}, {location.lng}
                  </small>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
