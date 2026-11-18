/* Retratos dos militares — ilustração vetorial flat.
   buildPortrait(look) devolve uma string SVG. O chapéu, os óculos e a pele
   esverdeada vêm do solicitante apresentado; o restante vem do militar real. */

const PORTRAIT_LOOKS = {
  "8841-FM": { // Francis Mosses — leiteiro
    bg: "#e8654a", skin: "#f1b394", shade: "#dc967b", hair: "#4a2f22", style: "crop",
    jacket: "#4b5a35", hat: "#556b3a", facial: "mustache"
  },
  "3920-AR": { // Ana Rudboys — professora
    bg: "#7c6bd1", skin: "#c98f6b", shade: "#b57655", hair: "#1c1a2b", style: "bob",
    jacket: "#3d4f3a", hat: "#3c4a2e"
  },
  "7719-WA": { // Dr. W. Afton — médico
    bg: "#2fa39a", skin: "#efc2a4", shade: "#d9a688", hair: "#b9bdc4", style: "receding",
    jacket: "#5a4e36", hat: "#6b5a3a"
  },
  "5510-ML": { // Mia Lin — engenheira
    bg: "#f2a93b", skin: "#f6cdb0", shade: "#e0ad90", hair: "#15182e", style: "bun",
    jacket: "#2f4458", hat: "#2f3b4f"
  },
  "6102-CR": { // Carlos Rocha — padeiro
    bg: "#4a8fd4", skin: "#d49a73", shade: "#bb7f5a", hair: "#2b1a14", style: "crop",
    jacket: "#4f5a40", hat: "#4a5a36", facial: "beard"
  },
  "9034-EB": { // Elena Vance — advogada
    bg: "#d9577f", skin: "#8d5a3b", shade: "#744630", hair: "#150f10", style: "curly",
    jacket: "#2c3b30", hat: "#3a3f44"
  },
  "2280-JS": { // Jonas Silva — eletricista
    bg: "#58b36a", skin: "#6e4430", shade: "#5a3524", hair: "#0f0d0e", style: "buzz",
    jacket: "#6a5a3c", hat: "#5c6b40"
  },
  "4491-PT": { // Paula Torres — enfermeira
    bg: "#5fb7d9", skin: "#f3c2a2", shade: "#dca486", hair: "#c68a3a", style: "long",
    jacket: "#3f5246", hat: "#46563a"
  },
  "7355-RK": { // Ravi Kumar — contador
    bg: "#e8654a", skin: "#c58a64", shade: "#ad7250", hair: "#14204a", style: "fringe",
    jacket: "#2f3a2e", hat: "#394634"
  },
  "1802-LM": { // Lia Martins — bibliotecária
    bg: "#8bb35a", skin: "#f0bf9d", shade: "#d9a283", hair: "#8e3b25", style: "long",
    jacket: "#505a4a", hat: "#6b5f3e"
  },
  "5502-BN": { // Bruno Nakamura — mecânico
    bg: "#b4654a", skin: "#eec4a5", shade: "#d6a687", hair: "#22201e", style: "crop",
    jacket: "#4a4438", hat: "#4d4738", facial: "beard"
  },
  "3388-DS": { // Débora Sales — médica
    bg: "#4fd0b8", skin: "#e8b48e", shade: "#cf9a75", hair: "#3d1f14", style: "curly",
    jacket: "#37505c", hat: "#3b4750"
  },
  "4771-OT": { // Otávio Tavares — cozinheiro
    bg: "#c99040", skin: "#a06a45", shade: "#87553a", hair: "#171310", style: "receding",
    jacket: "#55503a", hat: "#5f5a3e", facial: "mustache"
  },
  "6620-NF": { // Natália Freire — operadora de rádio
    bg: "#6a7fd4", skin: "#c78f66", shade: "#af7550", hair: "#26150f", style: "bob",
    jacket: "#3c4a52", hat: "#39454c"
  },
  "9125-IC": { // Igor Chernov — sargento de abastecimento
    bg: "#7f5ab0", skin: "#eec3a2", shade: "#d6a683", hair: "#8f939b", style: "buzz",
    jacket: "#42503f", hat: "#4a5742"
  },
  "2874-LC": { // Lucy Chen — armeira
    bg: "#d45a9a", skin: "#f4c9a6", shade: "#dcaa88", hair: "#12141f", style: "bun",
    jacket: "#2e4052", hat: "#33424f"
  }
};

const PORTRAIT_FALLBACK = PORTRAIT_LOOKS["7355-RK"];

function portraitShade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + amount * (amount < 0 ? c : 255 - c))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/* Cabelo: cada estilo tem camada de trás (atrás do rosto) e da frente. */
function portraitHair(style, c, d) {
  const styles = {
    fringe: {
      back: "",
      front: `<path d="M60 112 C50 58 84 30 122 30 C164 30 192 58 180 112 L172 112 C170 96 164 86 152 80 C150 88 146 92 140 92 C132 84 112 80 94 82 C82 86 74 98 68 112 Z" fill="${c}"/>
              <path d="M122 32 C126 50 134 66 146 80" stroke="${d}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    },
    crop: {
      back: "",
      front: `<path d="M64 106 C56 56 88 32 122 32 C158 32 190 56 178 106 C174 88 162 74 122 72 C84 74 70 88 64 106 Z" fill="${c}"/>`
    },
    buzz: {
      back: "",
      front: `<path d="M67 100 C64 62 90 50 120 50 C150 50 176 62 173 100 C166 82 150 74 120 74 C90 74 74 82 67 100 Z" fill="${c}"/>`
    },
    receding: {
      back: "",
      front: `<path d="M66 108 C60 84 68 66 84 58 L90 80 C80 86 76 98 74 112 Z" fill="${c}"/>
              <path d="M174 108 C180 84 172 66 156 58 L150 80 C160 86 164 98 166 112 Z" fill="${c}"/>
              <path d="M90 62 C106 52 134 52 150 62 C134 60 106 60 90 62 Z" fill="${c}"/>`
    },
    bob: {
      back: `<path d="M54 124 C46 56 84 28 120 28 C158 28 196 56 186 124 L188 184 C188 196 172 200 162 194 L160 120 L80 120 L78 194 C68 200 52 196 52 184 Z" fill="${c}"/>`,
      front: `<path d="M64 106 C58 58 88 40 120 40 C154 40 182 58 176 106 C164 84 146 72 120 70 C96 72 76 84 64 106 Z" fill="${c}"/>`
    },
    long: {
      back: `<path d="M54 120 C46 54 84 28 120 28 C158 28 196 54 186 120 L190 204 C190 214 172 218 164 210 L160 120 L80 120 L76 210 C68 218 50 214 50 204 Z" fill="${c}"/>`,
      front: `<path d="M66 116 C56 62 90 38 120 38 C152 38 184 62 174 116 C166 90 148 66 120 62 C94 66 74 90 66 116 Z" fill="${c}"/>
              <path d="M120 38 L120 62" stroke="${d}" stroke-width="3" stroke-linecap="round"/>`
    },
    bun: {
      back: `<circle cx="120" cy="30" r="21" fill="${c}"/>`,
      front: `<path d="M64 108 C58 56 88 36 120 36 C154 36 182 56 176 108 C168 86 150 70 120 68 C92 70 72 86 64 108 Z" fill="${c}"/>
              <path d="M104 34 Q120 44 136 34" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    },
    curly: {
      back: [[78, 54, 24], [104, 38, 24], [136, 38, 24], [162, 54, 24], [60, 86, 22], [180, 86, 22], [58, 118, 20], [182, 118, 20]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join(""),
      front: `<path d="M68 104 C64 62 92 48 120 48 C150 48 176 62 172 104 C164 84 148 74 120 72 C94 74 76 84 68 104 Z" fill="${c}"/>`
    }
  };
  return styles[style] || styles.crop;
}

function portraitHat(color) {
  const dark = portraitShade(color, -0.22);
  return `<path d="M68 76 C66 18 174 18 172 76 Z" fill="${color}"/>
          <path d="M68 76 C72 62 84 50 100 42 C86 58 82 68 84 76 Z" fill="${dark}" opacity=".35"/>
          <path d="M60 74 L180 74 C180 85 152 91 120 91 C88 91 60 85 60 74 Z" fill="${dark}"/>
          <path d="M70 69 C100 62 140 62 170 69" stroke="${dark}" stroke-width="3" fill="none" opacity=".55"/>
          <path d="M120 40 L123.5 49 L133 49.5 L125.6 55.5 L128 65 L120 59.8 L112 65 L114.4 55.5 L107 49.5 L116.5 49 Z" fill="#e8c14a" stroke="#a8862a" stroke-width="1"/>`;
}

function portraitGlasses() {
  return `<g fill="#bfe0e8" fill-opacity=".28" stroke="#1b2233" stroke-width="4" stroke-linecap="round">
            <circle cx="96" cy="117" r="17"/><circle cx="144" cy="117" r="17"/>
          </g>
          <path d="M113 115 Q120 110 127 115 M79 115 L67 112 M161 115 L173 112" stroke="#1b2233" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}

function portraitFacial(kind, c) {
  if (kind === "mustache") {
    return `<path d="M100 160 Q110 150 120 156 Q130 150 140 160 Q130 164 120 161 Q110 164 100 160 Z" fill="${c}"/>`;
  }
  if (kind === "beard") {
    return `<path d="M69 128 C70 178 94 208 120 208 C146 208 170 178 171 128 L163 130 C162 162 146 180 120 180 C94 180 78 162 77 130 Z" fill="${c}"/>
            <path d="M100 160 Q110 152 120 157 Q130 152 140 160 Q130 165 120 162 Q110 165 100 160 Z" fill="${c}"/>`;
  }
  return "";
}

function buildPortrait(opts) {
  const look = Object.assign({}, PORTRAIT_FALLBACK, opts.look || {});
  const green = !!opts.green;
  const skin = green ? "#9dbf98" : look.skin;
  const shade = green ? "#7fa07d" : look.shade;
  const blush = green ? "#6f9470" : portraitShade(look.skin, -0.14);
  const hairDark = portraitShade(look.hair, -0.35);
  const brow = portraitShade(look.hair, look.hair === "#b9bdc4" ? -0.45 : -0.2);
  const ink = "#14204a";
  const hair = portraitHair(look.style, look.hair, hairDark);
  const jacketDark = portraitShade(look.jacket, -0.25);
  const uid = "p" + Math.random().toString(36).slice(2, 7);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 250" class="portrait-svg" role="img" aria-label="Retrato do solicitante">
  <defs><clipPath id="${uid}"><circle cx="120" cy="125" r="118"/></clipPath></defs>
  <circle cx="120" cy="125" r="118" fill="${look.bg}"/>
  <ellipse cx="120" cy="58" rx="86" ry="52" fill="#ffffff" opacity=".07"/>
  <ellipse cx="120" cy="235" rx="100" ry="46" fill="#000000" opacity=".12"/>
  <g clip-path="url(#${uid})">
    ${hair.back}
    <path d="M12 252 C18 214 58 196 96 192 L144 192 C182 196 222 214 228 252 Z" fill="${look.jacket}"/>
    <path d="M28 222 C42 203 62 195 84 192 L92 212 C68 214 48 221 34 234 Z" fill="${jacketDark}" opacity=".6"/>
    <path d="M212 222 C198 203 178 195 156 192 L148 212 C172 214 192 221 206 234 Z" fill="${jacketDark}" opacity=".6"/>
    <rect x="78" y="192" width="34" height="7" rx="3" transform="rotate(-4 95 195)" fill="${portraitShade(look.jacket, -0.4)}"/>
    <rect x="128" y="192" width="34" height="7" rx="3" transform="rotate(4 145 195)" fill="${portraitShade(look.jacket, -0.4)}"/>
    <circle cx="95" cy="196" r="3" fill="#e8c14a"/>
    <circle cx="145" cy="196" r="3" fill="#e8c14a"/>
    <path d="M58 206 L66 252 M182 206 L174 252" stroke="${jacketDark}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
    <path d="M88 190 L152 190 L172 252 L68 252 Z" fill="#d8d0aa"/>
    <path d="M104 196 L104 214 L96 210 Z M136 196 L136 214 L144 210 Z" fill="${portraitShade(look.jacket, -0.45)}"/>
    <path d="M102 150 L102 192 L120 230 L138 192 L138 150 Z" fill="${skin}"/>
    <path d="M102 164 Q120 194 138 164 L138 150 L102 150 Z" fill="${shade}"/>
    <path d="M86 190 L108 186 L120 232 L94 212 Z M154 190 L132 186 L120 232 L146 212 Z" fill="#e6dfbf" stroke="#b9b08a" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="62" cy="124" rx="11" ry="16" fill="${skin}"/>
    <ellipse cx="178" cy="124" rx="11" ry="16" fill="${skin}"/>
    <path d="M60 120 Q64 126 62 132 M180 120 Q176 126 178 132" stroke="${shade}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M68 96 C68 62 92 50 120 50 C148 50 172 62 172 96 L172 124 C172 168 150 202 120 205 C90 202 68 168 68 124 Z" fill="${skin}"/>
    ${portraitFacial(look.facial === "beard" ? "beard" : "", look.hair)}
    <ellipse cx="90" cy="144" rx="14" ry="8" fill="${blush}" opacity=".55"/>
    <ellipse cx="150" cy="144" rx="14" ry="8" fill="${blush}" opacity=".55"/>
    <path d="M124 118 L117 140 Q122 147 129 142" stroke="${portraitShade(look.skin, -0.28)}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M101 164 Q120 170 139 164 Q134 180 120 180 Q106 180 101 164 Z" fill="#ffffff"/>
    ${look.facial === "mustache" ? portraitFacial("mustache", look.hair) : ""}
    <path d="M114 190 Q120 192 126 190" stroke="${shade}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="96" cy="117" rx="5" ry="6.5" fill="${ink}"/>
    <ellipse cx="144" cy="117" rx="5" ry="6.5" fill="${ink}"/>
    <path d="M82 102 Q96 95 110 101 M130 101 Q144 95 158 102" stroke="${brow}" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    ${hair.front}
    ${opts.hat ? portraitHat(look.hat) : ""}
    ${opts.glasses ? portraitGlasses() : ""}
  </g>
</svg>`;
}

if (typeof module !== "undefined") module.exports = { buildPortrait, PORTRAIT_LOOKS };
