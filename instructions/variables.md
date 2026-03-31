# Report Template Variables

All variables are used as `{{variable_name}}` in report templates.

---

## User & Birth Data

| Variable | Description |
|----------|-------------|
| `{{user_email}}` | User's email address |
| `{{user_name}}` | User's display name |
| `{{birth_name}}` | Full name at birth |
| `{{birth_date}}` | Birth date |
| `{{birth_time}}` | Birth time |
| `{{birth_city}}` | Birth city |
| `{{birth_country}}` | Birth country |
| `{{birth_location}}` | Birth location (city + country combined) |
| `{{birth_latitude}}` | Birth latitude |
| `{{birth_longitude}}` | Birth longitude |
| `{{timezone}}` | Timezone at birth location |
| `{{gender}}` | Gender |
| `{{observation_city}}` | Current observation/transit city |
| `{{observation_latitude}}` | Observation latitude |
| `{{observation_longitude}}` | Observation longitude |

---

## Intake / Onboarding

| Variable | Description |
|----------|-------------|
| `{{intake_life_situation}}` | User's stated life situation |
| `{{intake_primary_focus}}` | User's primary focus area |
| `{{intake_wants_clarity}}` | What the user wants clarity on |

---

## Human Design

| Variable | Description |
|----------|-------------|
| `{{hd_type}}` | HD Type (Generator, Projector, Manifestor, Reflector, MG) |
| `{{hd_strategy}}` | HD Strategy |
| `{{hd_authority}}` | HD Authority |
| `{{hd_profile}}` | HD Profile (e.g. 2/4) |
| `{{hd_definition}}` | HD Definition (Single, Split, Triple, Quadruple) |
| `{{hd_signature}}` | HD Signature (positive emotional theme) |
| `{{hd_not_self_theme}}` | HD Not-Self Theme (negative conditioning theme) |
| `{{hd_incarnation_cross_type}}` | Incarnation Cross type |
| `{{hd_incarnation_cross_gates}}` | Incarnation Cross gates (text) |
| `{{hd_incarnation_cross_json}}` | Incarnation Cross full data (JSON) |
| `{{hd_defined_centers}}` | Defined centers (text list) |
| `{{hd_undefined_centers}}` | Undefined centers (text list) |
| `{{hd_active_gates}}` | Active gates (text list) |
| `{{hd_active_channels_json}}` | Active channels (JSON) |
| `{{hd_variables_json}}` | HD Variables (JSON) |
| `{{hd_personality_activations_json}}` | Personality activations (JSON) |
| `{{hd_design_activations_json}}` | Design activations (JSON) |
| `{{hd_design_date}}` | Design date (approx. 88 days before birth) |

---

## Vedic Astrology — Core

| Variable | Description |
|----------|-------------|
| `{{lagna}}` | Ascendant sign (Lagna) |
| `{{sun_sign}}` | Vedic Sun sign |
| `{{moon_sign}}` | Vedic Moon sign |
| `{{vedic_json}}` | Full Vedic chart (JSON) |
| `{{vedic_planets_json}}` | All planets data (JSON) |
| `{{vedic_houses_json}}` | All houses data (JSON) |
| `{{sade_sati}}` | Sade Sati status |
| `{{current_mahadasha}}` | Current Mahadasha lord |
| `{{current_antardasha}}` | Current Antardasha lord |
| `{{current_dasha}}` | Current dasha summary (combined) |
| `{{dashas_json}}` | Full dasha timeline (JSON) |
| `{{transit_json}}` | Current transit data (JSON) |
| `{{transit_date}}` | Transit date |
| `{{today_date}}` | Today's date (formatted) |
| `{{today_iso}}` | Today's date (ISO 8601) |

---

## Vedic Astrology — Planet Positions

For each planet: sign, degree, retrograde flag.

| Variable | Description |
|----------|-------------|
| `{{vedic_sun_sign}}` | Sun sign |
| `{{vedic_sun_degree}}` | Sun degree within sign |
| `{{vedic_sun_retro}}` | Sun retrograde (true/false) |
| `{{vedic_moon_sign}}` | Moon sign |
| `{{vedic_moon_degree}}` | Moon degree |
| `{{vedic_moon_retro}}` | Moon retrograde |
| `{{vedic_mars_sign}}` | Mars sign |
| `{{vedic_mars_degree}}` | Mars degree |
| `{{vedic_mars_retro}}` | Mars retrograde |
| `{{vedic_mercury_sign}}` | Mercury sign |
| `{{vedic_mercury_degree}}` | Mercury degree |
| `{{vedic_mercury_retro}}` | Mercury retrograde |
| `{{vedic_jupiter_sign}}` | Jupiter sign |
| `{{vedic_jupiter_degree}}` | Jupiter degree |
| `{{vedic_jupiter_retro}}` | Jupiter retrograde |
| `{{vedic_venus_sign}}` | Venus sign |
| `{{vedic_venus_degree}}` | Venus degree |
| `{{vedic_venus_retro}}` | Venus retrograde |
| `{{vedic_saturn_sign}}` | Saturn sign |
| `{{vedic_saturn_degree}}` | Saturn degree |
| `{{vedic_saturn_retro}}` | Saturn retrograde |
| `{{vedic_rahu_sign}}` | Rahu (North Node) sign |
| `{{vedic_rahu_degree}}` | Rahu degree |
| `{{vedic_ketu_sign}}` | Ketu (South Node) sign |
| `{{vedic_ketu_degree}}` | Ketu degree |
| `{{vedic_lagna_degree}}` | Ascendant degree within sign |

---

## Vedic Astrology — House Cusp Signs

| Variable | Description |
|----------|-------------|
| `{{vedic_house_1_sign}}` | 1st house sign (Ascendant) |
| `{{vedic_house_2_sign}}` | 2nd house sign |
| `{{vedic_house_3_sign}}` | 3rd house sign |
| `{{vedic_house_4_sign}}` | 4th house sign |
| `{{vedic_house_5_sign}}` | 5th house sign |
| `{{vedic_house_6_sign}}` | 6th house sign |
| `{{vedic_house_7_sign}}` | 7th house sign |
| `{{vedic_house_8_sign}}` | 8th house sign |
| `{{vedic_house_9_sign}}` | 9th house sign |
| `{{vedic_house_10_sign}}` | 10th house sign |
| `{{vedic_house_11_sign}}` | 11th house sign |
| `{{vedic_house_12_sign}}` | 12th house sign |

---

## Vedic Astrology — Dasha Period Dates

| Variable | Description |
|----------|-------------|
| `{{dasha_mahadasha_start}}` | Current Mahadasha start date |
| `{{dasha_mahadasha_end}}` | Current Mahadasha end date |
| `{{dasha_antardasha_start}}` | Current Antardasha start date |
| `{{dasha_antardasha_end}}` | Current Antardasha end date |

---

## Special Points — Foundation (JSON Blobs)

| Variable | Description |
|----------|-------------|
| `{{sp_foundation_json}}` | Foundation special points (JSON) |
| `{{sp_extended_json}}` | Extended special points (JSON) |
| `{{sp_charakarakas_json}}` | All Chara Karakas (JSON) |
| `{{sp_dhooma_chain_json}}` | Dhooma chain points (JSON) |
| `{{sp_kaal_velas_json}}` | Kaal Velas / Upagrahas (JSON) |

---

## Special Points — Natal Point

| Variable | Description |
|----------|-------------|
| `{{sp_natal_sign}}` | Natal special point sign |
| `{{sp_natal_house}}` | Natal special point house |
| `{{sp_natal_nakshatra}}` | Natal nakshatra |
| `{{sp_natal_pada}}` | Natal pada |
| `{{sp_natal_rasi_name}}` | Natal rasi name |

---

## Special Points — Arudha Lagna (AL)

| Variable | Description |
|----------|-------------|
| `{{sp_arudha_sign}}` | Arudha Lagna sign |
| `{{sp_arudha_house}}` | Arudha Lagna house |
| `{{sp_arudha_nakshatra}}` | Nakshatra |
| `{{sp_arudha_pada}}` | Pada |
| `{{sp_arudha_rasi_name}}` | Rasi name |
| `{{sp_AL_sign}}` | Arudha Lagna sign (alias) |
| `{{sp_AL_house}}` | Arudha Lagna house (alias) |
| `{{sp_AL_nakshatra}}` | Nakshatra (alias) |
| `{{sp_AL_pada}}` | Pada (alias) |
| `{{sp_AL_rasi_name}}` | Rasi name (alias) |

---

## Special Points — Ghati Lagna

| Variable | Description |
|----------|-------------|
| `{{sp_ghati_sign}}` | Ghati Lagna sign |
| `{{sp_ghati_house}}` | House |
| `{{sp_ghati_nakshatra}}` | Nakshatra |
| `{{sp_ghati_pada}}` | Pada |
| `{{sp_ghati_rasi_name}}` | Rasi name |
| `{{sp_ghati_degree}}` | Degree |

---

## Special Points — Bhava Lagna

| Variable | Description |
|----------|-------------|
| `{{sp_bhava_sign}}` | Bhava Lagna sign |
| `{{sp_bhava_house}}` | House |
| `{{sp_bhava_nakshatra}}` | Nakshatra |
| `{{sp_bhava_pada}}` | Pada |
| `{{sp_bhava_rasi_name}}` | Rasi name |
| `{{sp_bhava_degree}}` | Degree |

---

## Special Points — Hora Lagna

| Variable | Description |
|----------|-------------|
| `{{sp_hora_sign}}` | Hora Lagna sign |
| `{{sp_hora_house}}` | House |
| `{{sp_hora_nakshatra}}` | Nakshatra |
| `{{sp_hora_pada}}` | Pada |
| `{{sp_hora_rasi_name}}` | Rasi name |
| `{{sp_hora_degree}}` | Degree |

---

## Special Points — Ghatika Lagna (GL)

| Variable | Description |
|----------|-------------|
| `{{sp_GL_sign}}` | GL sign |
| `{{sp_GL_house}}` | House |
| `{{sp_GL_nakshatra}}` | Nakshatra |
| `{{sp_GL_pada}}` | Pada |
| `{{sp_GL_rasi_name}}` | Rasi name |
| `{{sp_GL_degree}}` | Degree |

---

## Special Points — Bhrigu Lagna (BL)

| Variable | Description |
|----------|-------------|
| `{{sp_BL_sign}}` | BL sign |
| `{{sp_BL_house}}` | House |
| `{{sp_BL_nakshatra}}` | Nakshatra |
| `{{sp_BL_pada}}` | Pada |
| `{{sp_BL_rasi_name}}` | Rasi name |
| `{{sp_BL_degree}}` | Degree |

---

## Special Points — Hora Lagna (HL)

| Variable | Description |
|----------|-------------|
| `{{sp_HL_sign}}` | HL sign |
| `{{sp_HL_house}}` | House |
| `{{sp_HL_nakshatra}}` | Nakshatra |
| `{{sp_HL_pada}}` | Pada |
| `{{sp_HL_rasi_name}}` | Rasi name |
| `{{sp_HL_degree}}` | Degree |

---

## Special Points — Chara Karakas (Full Name)

Each karaka has: planet, sign, house, nakshatra, pada, rasi_name.

| Karaka | Variables |
|--------|-----------|
| Atmakaraka (Soul) | `{{sp_atmakaraka_planet}}` `{{sp_atmakaraka_sign}}` `{{sp_atmakaraka_house}}` `{{sp_atmakaraka_nakshatra}}` `{{sp_atmakaraka_pada}}` `{{sp_atmakaraka_rasi_name}}` |
| Amatyakaraka (Career) | `{{sp_amatyakaraka_planet}}` `{{sp_amatyakaraka_sign}}` `{{sp_amatyakaraka_house}}` `{{sp_amatyakaraka_nakshatra}}` `{{sp_amatyakaraka_pada}}` `{{sp_amatyakaraka_rasi_name}}` |
| Bhratrukaraka (Siblings) | `{{sp_bhratrukaraka_planet}}` `{{sp_bhratrukaraka_sign}}` `{{sp_bhratrukaraka_house}}` `{{sp_bhratrukaraka_nakshatra}}` `{{sp_bhratrukaraka_pada}}` `{{sp_bhratrukaraka_rasi_name}}` |
| Matrukaraka (Mother) | `{{sp_matrukaraka_planet}}` `{{sp_matrukaraka_sign}}` `{{sp_matrukaraka_house}}` `{{sp_matrukaraka_nakshatra}}` `{{sp_matrukaraka_pada}}` `{{sp_matrukaraka_rasi_name}}` |
| Pitrukaraka (Father) | `{{sp_pitrukaraka_planet}}` `{{sp_pitrukaraka_sign}}` `{{sp_pitrukaraka_house}}` `{{sp_pitrukaraka_nakshatra}}` `{{sp_pitrukaraka_pada}}` `{{sp_pitrukaraka_rasi_name}}` |
| Putrakaraka (Children) | `{{sp_putrakaraka_planet}}` `{{sp_putrakaraka_sign}}` `{{sp_putrakaraka_house}}` `{{sp_putrakaraka_nakshatra}}` `{{sp_putrakaraka_pada}}` `{{sp_putrakaraka_rasi_name}}` |
| Gnatikaraka (Enemies) | `{{sp_gnatikaraka_planet}}` `{{sp_gnatikaraka_sign}}` `{{sp_gnatikaraka_house}}` `{{sp_gnatikaraka_nakshatra}}` `{{sp_gnatikaraka_pada}}` `{{sp_gnatikaraka_rasi_name}}` |
| Darakaraka (Spouse) | `{{sp_darakaraka_planet}}` `{{sp_darakaraka_sign}}` `{{sp_darakaraka_house}}` `{{sp_darakaraka_nakshatra}}` `{{sp_darakaraka_pada}}` `{{sp_darakaraka_rasi_name}}` |

---

## Special Points — Chara Karakas (Short Code)

Same data as above, accessed via abbreviated codes.

| Code | Variables |
|------|-----------|
| AK (Atmakaraka) | `{{sp_AK_planet}}` `{{sp_AK_sign}}` `{{sp_AK_house}}` `{{sp_AK_nakshatra}}` `{{sp_AK_pada}}` `{{sp_AK_rasi_name}}` |
| AmK (Amatyakaraka) | `{{sp_AmK_planet}}` `{{sp_AmK_sign}}` `{{sp_AmK_house}}` `{{sp_AmK_nakshatra}}` `{{sp_AmK_pada}}` `{{sp_AmK_rasi_name}}` |
| BK (Bhratrukaraka) | `{{sp_BK_planet}}` `{{sp_BK_sign}}` `{{sp_BK_house}}` `{{sp_BK_nakshatra}}` `{{sp_BK_pada}}` `{{sp_BK_rasi_name}}` |
| MK (Matrukaraka) | `{{sp_MK_planet}}` `{{sp_MK_sign}}` `{{sp_MK_house}}` `{{sp_MK_nakshatra}}` `{{sp_MK_pada}}` `{{sp_MK_rasi_name}}` |
| PiK (Pitrukaraka) | `{{sp_PiK_planet}}` `{{sp_PiK_sign}}` `{{sp_PiK_house}}` `{{sp_PiK_nakshatra}}` `{{sp_PiK_pada}}` `{{sp_PiK_rasi_name}}` |
| PuK (Putrakaraka) | `{{sp_PuK_planet}}` `{{sp_PuK_sign}}` `{{sp_PuK_house}}` `{{sp_PuK_nakshatra}}` `{{sp_PuK_pada}}` `{{sp_PuK_rasi_name}}` |
| GK (Gnatikaraka) | `{{sp_GK_planet}}` `{{sp_GK_sign}}` `{{sp_GK_house}}` `{{sp_GK_nakshatra}}` `{{sp_GK_pada}}` `{{sp_GK_rasi_name}}` |
| DK (Darakaraka) | `{{sp_DK_planet}}` `{{sp_DK_sign}}` `{{sp_DK_house}}` `{{sp_DK_nakshatra}}` `{{sp_DK_pada}}` `{{sp_DK_rasi_name}}` |

---

## Special Points — Varnada Lagna

| Variable | Description |
|----------|-------------|
| `{{sp_varnada_sign}}` | Varnada Lagna sign |
| `{{sp_varnada_house}}` | House |
| `{{sp_varnada_nakshatra}}` | Nakshatra |
| `{{sp_varnada_pada}}` | Pada |
| `{{sp_varnada_rasi_name}}` | Rasi name |
| `{{sp_varnada_count_from_aries}}` | Count from Aries |
| `{{sp_varnada_count_from_hora_lagna}}` | Count from Hora Lagna |
| `{{sp_varnada_lagna_is_odd}}` | Lagna is odd sign (true/false) |
| `{{sp_varnada_hora_is_odd}}` | Hora Lagna is odd sign (true/false) |

---

## Special Points — Pranapada (PP)

| Variable | Description |
|----------|-------------|
| `{{sp_pranapada_sign}}` | Pranapada sign |
| `{{sp_pranapada_degree}}` | Degree |
| `{{sp_pranapada_fortunate}}` | Fortunate placement (true/false) |
| `{{sp_pranapada_sun_modality}}` | Sun modality at birth |
| `{{sp_pranapada_house_from_lagna}}` | House from Lagna |
| `{{sp_pranapada_house}}` | House |
| `{{sp_pranapada_nakshatra}}` | Nakshatra |
| `{{sp_pranapada_pada}}` | Pada |
| `{{sp_pranapada_rasi_name}}` | Rasi name |
| `{{sp_PP_sign}}` | PP sign (alias) |
| `{{sp_PP_degree}}` | PP degree (alias) |
| `{{sp_PP_house}}` | PP house (alias) |
| `{{sp_PP_fortunate}}` | PP fortunate (alias) |
| `{{sp_PP_sun_modality}}` | PP sun modality (alias) |
| `{{sp_PP_nakshatra}}` | PP nakshatra (alias) |
| `{{sp_PP_pada}}` | PP pada (alias) |
| `{{sp_PP_rasi_name}}` | PP rasi name (alias) |

---

## Special Points — Upapada Lagna

| Variable | Description |
|----------|-------------|
| `{{sp_upapada_sign}}` | Upapada Lagna sign |
| `{{sp_upapada_house}}` | House |
| `{{sp_upapada_nakshatra}}` | Nakshatra |
| `{{sp_upapada_pada}}` | Pada |
| `{{sp_upapada_rasi_name}}` | Rasi name |
| `{{sp_upapada_twelfth_lord}}` | 12th house lord planet |
| `{{sp_upapada_lord_sign}}` | 12th lord's sign placement |
| `{{sp_upapada_steps}}` | Steps counted in calculation |
| `{{sp_upapada_exception}}` | Exception case applied (true/false) |

---

## Special Points — Sree Lagna

| Variable | Description |
|----------|-------------|
| `{{sp_sree_sign}}` | Sree Lagna sign |
| `{{sp_sree_house}}` | House |
| `{{sp_sree_nakshatra}}` | Nakshatra |
| `{{sp_sree_pada}}` | Pada |
| `{{sp_sree_rasi_name}}` | Rasi name |
| `{{sp_sree_ninth_lord_lagna_kalas}}` | 9th lord kalas from Lagna |
| `{{sp_sree_ninth_lord_moon_kalas}}` | 9th lord kalas from Moon |
| `{{sp_sree_total_kalas}}` | Total kalas |
| `{{sp_sree_remainder}}` | Remainder in calculation |

---

## Special Points — Bhrigu Bindu (BB)

| Variable | Description |
|----------|-------------|
| `{{sp_bhrigu_sign}}` | Bhrigu Bindu sign |
| `{{sp_bhrigu_longitude}}` | Full longitude |
| `{{sp_bhrigu_degree}}` | Degree within sign |
| `{{sp_bhrigu_house}}` | House |
| `{{sp_bhrigu_nakshatra}}` | Nakshatra |
| `{{sp_bhrigu_pada}}` | Pada |
| `{{sp_bhrigu_rasi_name}}` | Rasi name |
| `{{sp_BB_sign}}` | BB sign (alias) |
| `{{sp_BB_longitude}}` | BB longitude (alias) |
| `{{sp_BB_degree}}` | BB degree (alias) |

---

## Special Points — Beeja & Kshetra Sphuta

| Variable | Description |
|----------|-------------|
| `{{sp_beeja_sign}}` | Beeja Sphuta sign (male fertility) |
| `{{sp_beeja_degree}}` | Degree |
| `{{sp_beeja_longitude}}` | Full longitude |
| `{{sp_beeja_house}}` | House |
| `{{sp_beeja_nakshatra}}` | Nakshatra |
| `{{sp_beeja_pada}}` | Pada |
| `{{sp_beeja_rasi_name}}` | Rasi name |
| `{{sp_kshetra_sign}}` | Kshetra Sphuta sign (female fertility) |
| `{{sp_kshetra_degree}}` | Degree |
| `{{sp_kshetra_longitude}}` | Full longitude |
| `{{sp_kshetra_house}}` | House |
| `{{sp_kshetra_nakshatra}}` | Nakshatra |
| `{{sp_kshetra_pada}}` | Pada |
| `{{sp_kshetra_rasi_name}}` | Rasi name |

---

## Special Points — Trisphuta

| Variable | Description |
|----------|-------------|
| `{{sp_trisphuta_sign}}` | Trisphuta sign |
| `{{sp_trisphuta_longitude}}` | Full longitude |
| `{{sp_trisphuta_degree}}` | Degree |
| `{{sp_trisphuta_house}}` | House |
| `{{sp_trisphuta_nakshatra}}` | Nakshatra |
| `{{sp_trisphuta_pada}}` | Pada |
| `{{sp_trisphuta_rasi_name}}` | Rasi name |

---

## Special Points — Dhooma Chain (Shadow Points)

Each point has: sign, longitude, house, nakshatra, pada, rasi_name.

| Point | Sign | Longitude | House | Nakshatra | Pada | Rasi |
|-------|------|-----------|-------|-----------|------|------|
| Dhooma | `{{sp_dhooma_sign}}` | `{{sp_dhooma_longitude}}` | `{{sp_dhooma_house}}` | `{{sp_dhooma_nakshatra}}` | `{{sp_dhooma_pada}}` | `{{sp_dhooma_rasi_name}}` |
| Vyatipata | `{{sp_vyatipata_sign}}` | `{{sp_vyatipata_longitude}}` | `{{sp_vyatipata_house}}` | `{{sp_vyatipata_nakshatra}}` | `{{sp_vyatipata_pada}}` | `{{sp_vyatipata_rasi_name}}` |
| Parivesha | `{{sp_parivesha_sign}}` | `{{sp_parivesha_longitude}}` | `{{sp_parivesha_house}}` | `{{sp_parivesha_nakshatra}}` | `{{sp_parivesha_pada}}` | `{{sp_parivesha_rasi_name}}` |
| Indrachapa | `{{sp_indrachapa_sign}}` | `{{sp_indrachapa_longitude}}` | `{{sp_indrachapa_house}}` | `{{sp_indrachapa_nakshatra}}` | `{{sp_indrachapa_pada}}` | `{{sp_indrachapa_rasi_name}}` |
| Upaketu | `{{sp_upaketu_sign}}` | `{{sp_upaketu_longitude}}` | `{{sp_upaketu_house}}` | `{{sp_upaketu_nakshatra}}` | `{{sp_upaketu_pada}}` | `{{sp_upaketu_rasi_name}}` |

---

## Special Points — Kaal Velas / Upagrahas

Each upagraha has: sign, longitude, portion_number, start_min, end_min, house, nakshatra, pada, rasi_name.

| Upagraha | Variables |
|----------|-----------|
| Gulika | `{{sp_gulika_sign}}` `{{sp_gulika_longitude}}` `{{sp_gulika_portion_number}}` `{{sp_gulika_start_min}}` `{{sp_gulika_end_min}}` `{{sp_gulika_house}}` `{{sp_gulika_nakshatra}}` `{{sp_gulika_pada}}` `{{sp_gulika_rasi_name}}` |
| Maandi | `{{sp_maandi_sign}}` `{{sp_maandi_longitude}}` `{{sp_maandi_portion_number}}` `{{sp_maandi_start_min}}` `{{sp_maandi_end_min}}` `{{sp_maandi_house}}` `{{sp_maandi_nakshatra}}` `{{sp_maandi_pada}}` `{{sp_maandi_rasi_name}}` |
| Kaala | `{{sp_kaala_sign}}` `{{sp_kaala_longitude}}` `{{sp_kaala_portion_number}}` `{{sp_kaala_start_min}}` `{{sp_kaala_end_min}}` `{{sp_kaala_house}}` `{{sp_kaala_nakshatra}}` `{{sp_kaala_pada}}` `{{sp_kaala_rasi_name}}` |
| Mrityu | `{{sp_mrityu_sign}}` `{{sp_mrityu_longitude}}` `{{sp_mrityu_portion_number}}` `{{sp_mrityu_start_min}}` `{{sp_mrityu_end_min}}` `{{sp_mrityu_house}}` `{{sp_mrityu_nakshatra}}` `{{sp_mrityu_pada}}` `{{sp_mrityu_rasi_name}}` |
| Ardhaprahara | `{{sp_ardhaprahara_sign}}` `{{sp_ardhaprahara_longitude}}` `{{sp_ardhaprahara_portion_number}}` `{{sp_ardhaprahara_start_min}}` `{{sp_ardhaprahara_end_min}}` `{{sp_ardhaprahara_house}}` `{{sp_ardhaprahara_nakshatra}}` `{{sp_ardhaprahara_pada}}` `{{sp_ardhaprahara_rasi_name}}` |
| Yamaghantaka | `{{sp_yamaghantaka_sign}}` `{{sp_yamaghantaka_longitude}}` `{{sp_yamaghantaka_portion_number}}` `{{sp_yamaghantaka_start_min}}` `{{sp_yamaghantaka_end_min}}` `{{sp_yamaghantaka_house}}` `{{sp_yamaghantaka_nakshatra}}` `{{sp_yamaghantaka_pada}}` `{{sp_yamaghantaka_rasi_name}}` |
