import type { Routine } from '@/types';

export const ROUTINES_SEED: Routine[] = [
  {
    id: 'rt_hipertrofia_4d',
    name: 'Hipertrofia — Torso/Pierna 4 días',
    goal: 'hipertrofia',
    level: 'intermedio',
    days_per_week: 4,
    description: 'Rutina dividida en torso y pierna, enfocada en ganancia de masa muscular con volumen moderado-alto.',
    assigned_member_ids: [],
    days: [
      {
        day_label: 'Día 1',
        focus: 'Torso — Empuje',
        items: [
          { exercise_id: 'ex_press_banca', sets: 4, reps: '8-10', rest_seconds: 90 },
          { exercise_id: 'ex_press_militar', sets: 3, reps: '10-12', rest_seconds: 75 },
          { exercise_id: 'ex_curl_biceps', sets: 3, reps: '12-15', rest_seconds: 60, notes: 'Superserie con tríceps si el gimnasio lo permite' },
        ],
      },
      {
        day_label: 'Día 2',
        focus: 'Pierna — Cuádriceps dominante',
        items: [
          { exercise_id: 'ex_sentadilla', sets: 4, reps: '6-8', rest_seconds: 120 },
          { exercise_id: 'ex_zancadas', sets: 3, reps: '12 c/pierna', rest_seconds: 75 },
          { exercise_id: 'ex_plancha', sets: 3, reps: '45 seg', rest_seconds: 45 },
        ],
      },
      {
        day_label: 'Día 3',
        focus: 'Torso — Tracción',
        items: [
          { exercise_id: 'ex_dominadas', sets: 4, reps: 'Al fallo', rest_seconds: 90 },
          { exercise_id: 'ex_remo_barra', sets: 4, reps: '8-10', rest_seconds: 90 },
        ],
      },
      {
        day_label: 'Día 4',
        focus: 'Pierna — Cadera dominante',
        items: [
          { exercise_id: 'ex_peso_muerto', sets: 4, reps: '6-8', rest_seconds: 120 },
          { exercise_id: 'ex_zancadas', sets: 3, reps: '12 c/pierna', rest_seconds: 75 },
        ],
      },
    ],
  },
  {
    id: 'rt_fuerza_3d',
    name: 'Fuerza — Full Body 3 días',
    goal: 'fuerza',
    level: 'avanzado',
    days_per_week: 3,
    description: 'Programa de fuerza basado en los tres levantamientos principales, ideal para atletas con experiencia.',
    assigned_member_ids: [],
    days: [
      {
        day_label: 'Día 1',
        focus: 'Sentadilla + accesorios',
        items: [
          { exercise_id: 'ex_sentadilla', sets: 5, reps: '5', rest_seconds: 150 },
          { exercise_id: 'ex_press_militar', sets: 4, reps: '6', rest_seconds: 120 },
        ],
      },
      {
        day_label: 'Día 2',
        focus: 'Press de banca + accesorios',
        items: [
          { exercise_id: 'ex_press_banca', sets: 5, reps: '5', rest_seconds: 150 },
          { exercise_id: 'ex_remo_barra', sets: 4, reps: '6', rest_seconds: 120 },
        ],
      },
      {
        day_label: 'Día 3',
        focus: 'Peso muerto + accesorios',
        items: [
          { exercise_id: 'ex_peso_muerto', sets: 4, reps: '4', rest_seconds: 180 },
          { exercise_id: 'ex_dominadas', sets: 4, reps: 'Al fallo', rest_seconds: 90 },
        ],
      },
    ],
  },
  {
    id: 'rt_perdida_grasa_5d',
    name: 'Pérdida de grasa — Metabólico 5 días',
    goal: 'perdida_grasa',
    level: 'principiante',
    days_per_week: 5,
    description: 'Circuitos de alta intensidad combinando fuerza y cardio para maximizar el gasto calórico.',
    assigned_member_ids: [],
    days: [
      {
        day_label: 'Día 1',
        focus: 'Circuito cuerpo completo',
        items: [
          { exercise_id: 'ex_burpees', sets: 4, reps: '30 seg', rest_seconds: 30 },
          { exercise_id: 'ex_zancadas', sets: 3, reps: '12 c/pierna', rest_seconds: 45 },
          { exercise_id: 'ex_plancha', sets: 3, reps: '40 seg', rest_seconds: 30 },
        ],
      },
      {
        day_label: 'Día 2',
        focus: 'Tren superior + core',
        items: [
          { exercise_id: 'ex_press_banca', sets: 3, reps: '12', rest_seconds: 60 },
          { exercise_id: 'ex_remo_barra', sets: 3, reps: '12', rest_seconds: 60 },
          { exercise_id: 'ex_plancha', sets: 3, reps: '45 seg', rest_seconds: 30 },
        ],
      },
      {
        day_label: 'Día 3',
        focus: 'HIIT metabólico',
        items: [{ exercise_id: 'ex_burpees', sets: 6, reps: '30 seg', rest_seconds: 30 }],
      },
      {
        day_label: 'Día 4',
        focus: 'Tren inferior',
        items: [
          { exercise_id: 'ex_sentadilla', sets: 4, reps: '15', rest_seconds: 60 },
          { exercise_id: 'ex_zancadas', sets: 3, reps: '15 c/pierna', rest_seconds: 45 },
        ],
      },
      {
        day_label: 'Día 5',
        focus: 'Full body ligero',
        items: [
          { exercise_id: 'ex_curl_biceps', sets: 3, reps: '15', rest_seconds: 45 },
          { exercise_id: 'ex_press_militar', sets: 3, reps: '12', rest_seconds: 60 },
        ],
      },
    ],
  },
];
