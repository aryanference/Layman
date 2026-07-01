# Update MarkdownPreview.tsx colors for dark theme
with open(r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src\components\MarkdownPreview.tsx', 'r') as f:
    content = f.read()

replacements = [
    ('text-white', 'var(--text-hero)'),
    ('text-zinc-200', 'var(--text-primary)'),
    ('text-zinc-100', 'var(--text-primary)'),
    ('text-zinc-300', 'var(--text-secondary)'),
    ('text-zinc-500', 'var(--text-muted)'),
    ('bg-black/25', 'rgba(255,255,255,0.08)'),
    ('bg-black/28', 'rgba(255,255,255,0.06)'),
    ('border-white/18', 'var(--glass-border)'),
    ('border-white/8', 'var(--glass-border)'),
    ('className="text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white/60"',
     'style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: "4px" }}'),
    ('className="rounded-md bg-black/25 px-1.5 py-0.5 font-mono text-[0.92em] text-white"',
     'style={{ borderRadius: "4px", background: "rgba(255,255,255,0.08)", padding: "1px 5px", fontFamily: "var(--font-mono)", fontSize: "0.92em", color: "var(--text-hero)" }}'),
    ('className="font-semibold text-white"',
     'style={{ fontWeight: 600, color: "var(--text-hero)" }}'),
    ('className="italic text-zinc-100"',
     'style={{ fontStyle: "italic", color: "var(--text-primary)" }}'),
    ('className="border-l-2 border-white/18 pl-4 text-sm italic text-zinc-300"',
     'style={{ borderLeft: "2px solid var(--glass-border)", paddingLeft: "16px", fontSize: "14px", fontStyle: "italic", color: "var(--text-secondary)" }}'),
    ('className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"',
     'style={{ marginBottom: "8px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text-muted)" }}'),
    ('className="whitespace-pre-wrap font-mono text-[13px] leading-6 text-zinc-200"',
     'style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: "1.6", color: "var(--text-primary)" }}'),
    ('className="h-px bg-white/8"',
     'style={{ height: "1px", background: "var(--glass-border)" }}'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(r'C:\Users\DELL\Documents\AI Agents\meridian\dashboard\src\components\MarkdownPreview.tsx', 'w') as f:
    f.write(content)

print('MarkdownPreview updated')
