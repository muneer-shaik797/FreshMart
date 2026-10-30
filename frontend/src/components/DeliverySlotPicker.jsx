import React from 'react';
import { Clock, Zap, Calendar, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const DeliverySlotPicker = () => {
  const { deliverySlot, setDeliverySlot } = useCartStore();

  const dates = [
    { label: 'Today', subtext: 'Earliest arrival' },
    { label: 'Tomorrow', subtext: 'Scheduled morning' },
    { label: 'Day After', subtext: 'Advance order' }
  ];

  const slots = [
    {
      slotId: 'express_45m',
      title: 'Express Delivery (Under 45 Mins)',
      type: 'EXPRESS',
      desc: 'Dispatched instantly from nearest fulfillment hub',
      extraFee: 25.0,
      badge: 'Popular ⚡',
      badgeColor: '#c2410c',
      badgeBg: '#ffedd5',
      icon: Zap
    },
    {
      slotId: 'morning_07_10',
      title: 'Morning Slot (07:00 AM - 10:00 AM)',
      type: 'STANDARD',
      desc: 'Freshly harvested dawn produce delivery',
      extraFee: 0.0,
      badge: 'Eco Free',
      badgeColor: '#15803d',
      badgeBg: '#dcfce7',
      icon: Clock
    },
    {
      slotId: 'afternoon_12_15',
      title: 'Afternoon Slot (12:00 PM - 03:00 PM)',
      type: 'STANDARD',
      desc: 'Optimal for afternoon lunch & cooking preparation',
      extraFee: 0.0,
      badge: 'Eco Free',
      badgeColor: '#15803d',
      badgeBg: '#dcfce7',
      icon: Clock
    },
    {
      slotId: 'evening_17_20',
      title: 'Evening Slot (05:00 PM - 08:00 PM)',
      type: 'STANDARD',
      desc: 'Delivered after work hours right to your door',
      extraFee: 0.0,
      badge: 'Eco Free',
      badgeColor: '#15803d',
      badgeBg: '#dcfce7',
      icon: Clock
    }
  ];

  const currentDate = deliverySlot?.date || 'Today';

  const handleDateChange = (dateLabel) => {
    setDeliverySlot({
      ...deliverySlot,
      date: dateLabel
    });
  };

  const handleSlotSelect = (slot) => {
    setDeliverySlot({
      slotId: slot.slotId,
      title: `${slot.title} (${currentDate})`,
      type: slot.type,
      extraFee: slot.extraFee,
      date: currentDate
    });
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Calendar size={20} color="var(--primary)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Schedule Delivery Slot</h3>
      </div>

      {/* Date selector tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.2rem' }}>
        {dates.map((d) => {
          const isSelected = currentDate === d.label;
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => handleDateChange(d.label)}
              style={{
                padding: '0.6rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--primary-light)' : '#f8fafc',
                color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)',
                textAlign: 'center',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{d.label}</div>
              <div style={{ fontSize: '0.7rem', color: isSelected ? 'var(--primary-dark)' : 'var(--text-muted)' }}>{d.subtext}</div>
            </button>
          );
        })}
      </div>

      {/* Slots selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {slots.map((s) => {
          const isSelected = deliverySlot?.slotId === s.slotId;
          const IconComp = s.icon;
          return (
            <div
              key={s.slotId}
              onClick={() => handleSlotSelect(s)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: isSelected ? 'var(--primary)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{s.title}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: s.badgeBg,
                      color: s.badgeColor
                    }}>
                      {s.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: s.extraFee > 0 ? 'var(--text-main)' : '#16a34a' }}>
                  {s.extraFee > 0 ? `+₹${s.extraFee}` : 'FREE'}
                </span>
                {isSelected ? (
                  <CheckCircle2 size={18} color="var(--primary)" />
                ) : (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid var(--border-strong)' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliverySlotPicker;
