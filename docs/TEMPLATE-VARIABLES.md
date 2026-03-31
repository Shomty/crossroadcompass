# Report Template Variables Reference

All `{{placeholder}}` keys available in `buildReportTemplateVars()`.
Use these in prompts, report templates, and the admin Variable Inspector.

Total: ~340 variables across 9 categories.

---

## 1. Identity & System

| Variable | Description |
|----------|-------------|
| `{{user_email}}` | User's email address |
| `{{user_name}}` | User's display name |
| `{{today_date}}` | Today's date (human-readable) |
| `{{today_iso}}` | Today's date (ISO 8601) |
| `{{transit_date}}` | Transit calculation date |

---

## 2. Birth Profile

| Variable | Description |
|----------|-------------|
| `{{birth_name}}` | Name at birth |
| `{{birth_date}}` | Birth date |
| `{{birth_time}}` | Birth time |
| `{{birth_city}}` | Birth city |
| `{{birth_country}}` | Birth country |
| `{{birth_location}}` | Combined birth location |
| `{{birth_latitude}}` | Birth latitude |
| `{{birth_longitude}}` | Birth longitude |
| `{{timezone}}` | Birth timezone |
| `{{gender}}` | Gender |
| `{{observation_city}}` | Current observation city |
| `{{observation_latitude}}` | Current observation latitude |
| `{{observation_longitude}}` | Current observation longitude |
| `{{intake_life_situation}}` | Life situation from intake |
| `{{intake_primary_focus}}` | Primary focus from intake |
| `{{intake_wants_clarity}}` | Clarity goal from intake |

---

## 3. Human Design

### Scalar Values

| Variable | Description |
|----------|-------------|
| `{{hd_type}}` | HD Type (Generator, Projector, etc.) |
| `{{hd_strategy}}` | HD Strategy |
| `{{hd_authority}}` | HD Authority |
| `{{hd_profile}}` | HD Profile (e.g. 2/4) |
| `{{hd_definition}}` | HD Definition (Single, Split, etc.) |
| `{{hd_signature}}` | HD Signature (satisfaction, success, etc.) |
| `{{hd_not_self_theme}}` | HD Not-Self Theme |
| `{{hd_incarnation_cross_type}}` | Incarnation cross type |
| `{{hd_incarnation_cross_gates}}` | Incarnation cross gates |
| `{{hd_defined_centers}}` | Defined centers list |
| `{{hd_undefined_centers}}` | Undefined centers list |
| `{{hd_active_gates}}` | All active gates |
| `{{hd_design_date}}` | Design calculation date |

### JSON Blobs

| Variable | Description |
|----------|-------------|
| `{{hd_incarnation_cross_json}}` | Full incarnation cross data |
| `{{hd_active_channels_json}}` | Active channels with gate pairs |
| `{{hd_variables_json}}` | HD Variables (arrows) |
| `{{hd_personality_activations_json}}` | Conscious (black) activations |
| `{{hd_design_activations_json}}` | Unconscious (red) activations |

---

## 4. Vedic Astrology — Core

### Scalar Values

| Variable | Description |
|----------|-------------|
| `{{lagna}}` | Ascendant sign |
| `{{sun_sign}}` | Sun sign |
| `{{moon_sign}}` | Moon sign |
| `{{sade_sati}}` | Sade Sati status |

### JSON Blobs

| Variable | Description |
|----------|-------------|
| `{{vedic_json}}` | Full Vedic chart data |
| `{{vedic_planets_json}}` | All planetary positions |
| `{{vedic_houses_json}}` | House data |

---

## 5. Vedic — Granular Planets

### Sun
| Variable | Description |
|----------|-------------|
| `{{vedic_sun_sign}}` | Sun sign |
| `{{vedic_sun_degree}}` | Sun degree |
| `{{vedic_sun_retro}}` | Sun retrograde (R or empty) |

### Moon
| Variable | Description |
|----------|-------------|
| `{{vedic_moon_sign}}` | Moon sign |
| `{{vedic_moon_degree}}` | Moon degree |
| `{{vedic_moon_retro}}` | Moon retrograde |

### Mars
| Variable | Description |
|----------|-------------|
| `{{vedic_mars_sign}}` | Mars sign |
| `{{vedic_mars_degree}}` | Mars degree |
| `{{vedic_mars_retro}}` | Mars retrograde |

### Mercury
| Variable | Description |
|----------|-------------|
| `{{vedic_mercury_sign}}` | Mercury sign |
| `{{vedic_mercury_degree}}` | Mercury degree |
| `{{vedic_mercury_retro}}` | Mercury retrograde |

### Jupiter
| Variable | Description |
|----------|-------------|
| `{{vedic_jupiter_sign}}` | Jupiter sign |
| `{{vedic_jupiter_degree}}` | Jupiter degree |
| `{{vedic_jupiter_retro}}` | Jupiter retrograde |

### Venus
| Variable | Description |
|----------|-------------|
| `{{vedic_venus_sign}}` | Venus sign |
| `{{vedic_venus_degree}}` | Venus degree |
| `{{vedic_venus_retro}}` | Venus retrograde |

### Saturn
| Variable | Description |
|----------|-------------|
| `{{vedic_saturn_sign}}` | Saturn sign |
| `{{vedic_saturn_degree}}` | Saturn degree |
| `{{vedic_saturn_retro}}` | Saturn retrograde |

### Rahu / Ketu (nodes — no retrograde)
| Variable | Description |
|----------|-------------|
| `{{vedic_rahu_sign}}` | Rahu sign |
| `{{vedic_rahu_degree}}` | Rahu degree |
| `{{vedic_ketu_sign}}` | Ketu sign |
| `{{vedic_ketu_degree}}` | Ketu degree |

### Lagna Degree
| Variable | Description |
|----------|-------------|
| `{{vedic_lagna_degree}}` | Ascendant degree |

---

## 6. Vedic — House Cusps (1–12)

| Variable | Description |
|----------|-------------|
| `{{vedic_house_1_sign}}` | House 1 sign |
| `{{vedic_house_2_sign}}` | House 2 sign |
| `{{vedic_house_3_sign}}` | House 3 sign |
| `{{vedic_house_4_sign}}` | House 4 sign |
| `{{vedic_house_5_sign}}` | House 5 sign |
| `{{vedic_house_6_sign}}` | House 6 sign |
| `{{vedic_house_7_sign}}` | House 7 sign |
| `{{vedic_house_8_sign}}` | House 8 sign |
| `{{vedic_house_9_sign}}` | House 9 sign |
| `{{vedic_house_10_sign}}` | House 10 sign |
| `{{vedic_house_11_sign}}` | House 11 sign |
| `{{vedic_house_12_sign}}` | House 12 sign |

---

## 7. Dasha Periods

| Variable | Description |
|----------|-------------|
| `{{current_mahadasha}}` | Current Mahadasha lord |
| `{{current_antardasha}}` | Current Antardasha lord |
| `{{current_dasha}}` | Current dasha summary |
| `{{dasha_mahadasha_start}}` | Mahadasha start date |
| `{{dasha_mahadasha_end}}` | Mahadasha end date |
| `{{dasha_antardasha_start}}` | Antardasha start date |
| `{{dasha_antardasha_end}}` | Antardasha end date |
| `{{dashas_json}}` | Full dasha timeline JSON |

---

## 8. Transits

| Variable | Description |
|----------|-------------|
| `{{transit_json}}` | Full transit data JSON |

---

## 9. Special Points — Foundation

### JSON Blobs
| Variable | Description |
|----------|-------------|
| `{{sp_foundation_json}}` | All foundation special points |
| `{{sp_extended_json}}` | All extended special points |
| `{{sp_charakarakas_json}}` | Chara karakas (7 planets) |
| `{{sp_dhooma_chain_json}}` | Dhooma chain (5 shadow points) |
| `{{sp_kaal_velas_json}}` | Kaal Velas (6 time lords) |

### Natal Lagna Placement
| Variable | Description |
|----------|-------------|
| `{{sp_natal_sign}}` | Natal sign |
| `{{sp_natal_house}}` | Natal house |
| `{{sp_natal_nakshatra}}` | Natal nakshatra |
| `{{sp_natal_pada}}` | Natal pada |
| `{{sp_natal_rasi_name}}` | Natal rasi name |

### Arudha Lagna (AL)
| Variable | Description |
|----------|-------------|
| `{{sp_arudha_sign}}` | Arudha sign |
| `{{sp_arudha_house}}` | Arudha house |
| `{{sp_arudha_nakshatra}}` | Arudha nakshatra |
| `{{sp_arudha_pada}}` | Arudha pada |
| `{{sp_arudha_rasi_name}}` | Arudha rasi name |
| `{{sp_AL_sign}}` | AL sign (alias) |
| `{{sp_AL_house}}` | AL house (alias) |
| `{{sp_AL_nakshatra}}` | AL nakshatra (alias) |
| `{{sp_AL_pada}}` | AL pada (alias) |
| `{{sp_AL_rasi_name}}` | AL rasi name (alias) |

### Ghati Lagna (GL)
| Variable | Description |
|----------|-------------|
| `{{sp_ghati_sign}}` | Ghati sign |
| `{{sp_ghati_house}}` | Ghati house |
| `{{sp_ghati_nakshatra}}` | Ghati nakshatra |
| `{{sp_ghati_pada}}` | Ghati pada |
| `{{sp_ghati_rasi_name}}` | Ghati rasi name |
| `{{sp_ghati_degree}}` | Ghati degree |
| `{{sp_GL_sign}}` | GL sign (alias) |
| `{{sp_GL_house}}` | GL house (alias) |
| `{{sp_GL_nakshatra}}` | GL nakshatra (alias) |
| `{{sp_GL_pada}}` | GL pada (alias) |
| `{{sp_GL_rasi_name}}` | GL rasi name (alias) |
| `{{sp_GL_degree}}` | GL degree (alias) |

### Bhava Lagna (BL)
| Variable | Description |
|----------|-------------|
| `{{sp_bhava_sign}}` | Bhava sign |
| `{{sp_bhava_house}}` | Bhava house |
| `{{sp_bhava_nakshatra}}` | Bhava nakshatra |
| `{{sp_bhava_pada}}` | Bhava pada |
| `{{sp_bhava_rasi_name}}` | Bhava rasi name |
| `{{sp_bhava_degree}}` | Bhava degree |
| `{{sp_BL_sign}}` | BL sign (alias) |
| `{{sp_BL_house}}` | BL house (alias) |
| `{{sp_BL_nakshatra}}` | BL nakshatra (alias) |
| `{{sp_BL_pada}}` | BL pada (alias) |
| `{{sp_BL_rasi_name}}` | BL rasi name (alias) |
| `{{sp_BL_degree}}` | BL degree (alias) |

### Hora Lagna (HL)
| Variable | Description |
|----------|-------------|
| `{{sp_hora_sign}}` | Hora sign |
| `{{sp_hora_house}}` | Hora house |
| `{{sp_hora_nakshatra}}` | Hora nakshatra |
| `{{sp_hora_pada}}` | Hora pada |
| `{{sp_hora_rasi_name}}` | Hora rasi name |
| `{{sp_hora_degree}}` | Hora degree |
| `{{sp_HL_sign}}` | HL sign (alias) |
| `{{sp_HL_house}}` | HL house (alias) |
| `{{sp_HL_nakshatra}}` | HL nakshatra (alias) |
| `{{sp_HL_pada}}` | HL pada (alias) |
| `{{sp_HL_rasi_name}}` | HL rasi name (alias) |
| `{{sp_HL_degree}}` | HL degree (alias) |

---

## 10. Chara Karakas

Each karaka has: `_planet`, `_sign`, `_house`, `_nakshatra`, `_pada`, `_rasi_name`.
Both full-name and abbreviation keys are available.

| Full Name | Abbrev | Role |
|-----------|--------|------|
| `sp_atmakaraka_*` | `sp_AK_*` | Atmakaraka (soul) |
| `sp_amatyakaraka_*` | `sp_AmK_*` | Amatyakaraka (career) |
| `sp_bhratrukaraka_*` | `sp_BK_*` | Bhratrukaraka (siblings) |
| `sp_matrukaraka_*` | `sp_MK_*` | Matrukaraka (mother) |
| `sp_pitrukaraka_*` | `sp_PiK_*` | Pitrukaraka (father) |
| `sp_putrakaraka_*` | `sp_PuK_*` | Putrakaraka (children) |
| `sp_gnatikaraka_*` | `sp_GK_*` | Gnatikaraka (obstacles) |
| `sp_darakaraka_*` | `sp_DK_*` | Darakaraka (spouse) |

**Example:** `{{sp_atmakaraka_planet}}`, `{{sp_AK_sign}}`, `{{sp_AK_nakshatra}}`

---

## 11. Extended Special Points

### Varnada Lagna
| Variable | Description |
|----------|-------------|
| `{{sp_varnada_sign}}` | Varnada sign |
| `{{sp_varnada_house}}` | Varnada house |
| `{{sp_varnada_nakshatra}}` | Varnada nakshatra |
| `{{sp_varnada_pada}}` | Varnada pada |
| `{{sp_varnada_rasi_name}}` | Varnada rasi name |
| `{{sp_varnada_count_from_aries}}` | Count from Aries |
| `{{sp_varnada_count_from_hora_lagna}}` | Count from Hora Lagna |
| `{{sp_varnada_lagna_is_odd}}` | Lagna is odd sign |
| `{{sp_varnada_hora_is_odd}}` | Hora Lagna is odd sign |

### Pranapada (PP)
| Variable | Description |
|----------|-------------|
| `{{sp_pranapada_sign}}` | Pranapada sign |
| `{{sp_pranapada_degree}}` | Pranapada degree |
| `{{sp_pranapada_fortunate}}` | Pranapada fortunate flag |
| `{{sp_pranapada_sun_modality}}` | Sun day/night modality |
| `{{sp_pranapada_house_from_lagna}}` | House from lagna |
| `{{sp_pranapada_house}}` | Pranapada house |
| `{{sp_pranapada_nakshatra}}` | Pranapada nakshatra |
| `{{sp_pranapada_pada}}` | Pranapada pada |
| `{{sp_pranapada_rasi_name}}` | Pranapada rasi name |
| `{{sp_PP_sign}}` | PP sign (alias) |
| `{{sp_PP_degree}}` | PP degree (alias) |
| `{{sp_PP_house}}` | PP house (alias) |
| `{{sp_PP_fortunate}}` | PP fortunate (alias) |
| `{{sp_PP_sun_modality}}` | PP sun modality (alias) |
| `{{sp_PP_nakshatra}}` | PP nakshatra (alias) |
| `{{sp_PP_pada}}` | PP pada (alias) |
| `{{sp_PP_rasi_name}}` | PP rasi name (alias) |

### Upapada Lagna
| Variable | Description |
|----------|-------------|
| `{{sp_upapada_sign}}` | Upapada sign |
| `{{sp_upapada_house}}` | Upapada house |
| `{{sp_upapada_nakshatra}}` | Upapada nakshatra |
| `{{sp_upapada_pada}}` | Upapada pada |
| `{{sp_upapada_rasi_name}}` | Upapada rasi name |
| `{{sp_upapada_twelfth_lord}}` | 12th house lord |
| `{{sp_upapada_lord_sign}}` | 12th lord's sign |
| `{{sp_upapada_steps}}` | Steps calculation |
| `{{sp_upapada_exception}}` | Exception rule applied |

### Sree Lagna
| Variable | Description |
|----------|-------------|
| `{{sp_sree_sign}}` | Sree Lagna sign |
| `{{sp_sree_house}}` | Sree Lagna house |
| `{{sp_sree_nakshatra}}` | Sree Lagna nakshatra |
| `{{sp_sree_pada}}` | Sree Lagna pada |
| `{{sp_sree_rasi_name}}` | Sree Lagna rasi name |
| `{{sp_sree_ninth_lord_lagna_kalas}}` | 9th lord lagna kalas |
| `{{sp_sree_ninth_lord_moon_kalas}}` | 9th lord moon kalas |
| `{{sp_sree_total_kalas}}` | Total kalas |
| `{{sp_sree_remainder}}` | Remainder |

### Bhrigu Bindu (BB)
| Variable | Description |
|----------|-------------|
| `{{sp_bhrigu_sign}}` | Bhrigu sign |
| `{{sp_bhrigu_longitude}}` | Bhrigu longitude |
| `{{sp_bhrigu_degree}}` | Bhrigu degree |
| `{{sp_bhrigu_house}}` | Bhrigu house |
| `{{sp_bhrigu_nakshatra}}` | Bhrigu nakshatra |
| `{{sp_bhrigu_pada}}` | Bhrigu pada |
| `{{sp_bhrigu_rasi_name}}` | Bhrigu rasi name |
| `{{sp_BB_sign}}` | BB sign (alias) |
| `{{sp_BB_longitude}}` | BB longitude (alias) |
| `{{sp_BB_degree}}` | BB degree (alias) |

### Beeja & Kshetra
| Variable | Description |
|----------|-------------|
| `{{sp_beeja_sign}}` | Beeja sign |
| `{{sp_beeja_degree}}` | Beeja degree |
| `{{sp_beeja_longitude}}` | Beeja longitude |
| `{{sp_beeja_house}}` | Beeja house |
| `{{sp_beeja_nakshatra}}` | Beeja nakshatra |
| `{{sp_beeja_pada}}` | Beeja pada |
| `{{sp_beeja_rasi_name}}` | Beeja rasi name |
| `{{sp_kshetra_sign}}` | Kshetra sign |
| `{{sp_kshetra_degree}}` | Kshetra degree |
| `{{sp_kshetra_longitude}}` | Kshetra longitude |
| `{{sp_kshetra_house}}` | Kshetra house |
| `{{sp_kshetra_nakshatra}}` | Kshetra nakshatra |
| `{{sp_kshetra_pada}}` | Kshetra pada |
| `{{sp_kshetra_rasi_name}}` | Kshetra rasi name |

### Trisphuta
| Variable | Description |
|----------|-------------|
| `{{sp_trisphuta_sign}}` | Trisphuta sign |
| `{{sp_trisphuta_longitude}}` | Trisphuta longitude |
| `{{sp_trisphuta_degree}}` | Trisphuta degree |
| `{{sp_trisphuta_house}}` | Trisphuta house |
| `{{sp_trisphuta_nakshatra}}` | Trisphuta nakshatra |
| `{{sp_trisphuta_pada}}` | Trisphuta pada |
| `{{sp_trisphuta_rasi_name}}` | Trisphuta rasi name |

---

## 12. Dhooma Chain (5 Shadow Points)

Each point has: `_sign`, `_longitude`, `_house`, `_nakshatra`, `_pada`, `_rasi_name`.

| Point | Variable Prefix |
|-------|----------------|
| Dhooma | `sp_dhooma_*` |
| Vyatipata | `sp_vyatipata_*` |
| Parivesha | `sp_parivesha_*` |
| Indrachapa | `sp_indrachapa_*` |
| Upaketu | `sp_upaketu_*` |

**Example:** `{{sp_dhooma_sign}}`, `{{sp_vyatipata_house}}`, `{{sp_upaketu_nakshatra}}`

---

## 13. Kaal Velas (6 Upagrahas)

Each has: `_sign`, `_longitude`, `_portion_number`, `_start_min`, `_end_min`, `_house`, `_nakshatra`, `_pada`, `_rasi_name`.

| Point | Variable Prefix |
|-------|----------------|
| Gulika | `sp_gulika_*` |
| Maandi | `sp_maandi_*` |
| Kaala | `sp_kaala_*` |
| Mrityu | `sp_mrityu_*` |
| Ardhaprahara | `sp_ardhaprahara_*` |
| Yamaghantaka | `sp_yamaghantaka_*` |

**Example:** `{{sp_gulika_sign}}`, `{{sp_maandi_house}}`, `{{sp_kaala_nakshatra}}`

---

*Source: `lib/reports/reportTemplateVariableKeys.ts` + `lib/reports/specialPointScalarKeys.ts`*
