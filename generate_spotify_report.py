# -*- coding: utf-8 -*-
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm, inch
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import SimpleDocTemplate

# ==================== FONT REGISTRATION ====================
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))

registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')

# ==================== TABLE COLORS ====================
TABLE_HEADER_COLOR = colors.HexColor('#1DB954')  # Spotify Green
TABLE_HEADER_TEXT = colors.white
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = colors.HexColor('#F0F0F0')

# ==================== STYLES ====================
cover_title_style = ParagraphStyle(
    name='CoverTitle', fontName='Times New Roman', fontSize=42,
    leading=50, alignment=TA_CENTER, spaceAfter=36, textColor=colors.HexColor('#1DB954')
)
cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle', fontName='Times New Roman', fontSize=18,
    leading=26, alignment=TA_CENTER, spaceAfter=24, textColor=colors.HexColor('#333333')
)
cover_author_style = ParagraphStyle(
    name='CoverAuthor', fontName='Times New Roman', fontSize=13,
    leading=20, alignment=TA_CENTER, spaceAfter=12, textColor=colors.HexColor('#666666')
)

h1_style = ParagraphStyle(
    name='H1', fontName='Times New Roman', fontSize=20,
    leading=28, alignment=TA_LEFT, spaceBefore=18, spaceAfter=12,
    textColor=colors.black
)
h2_style = ParagraphStyle(
    name='H2', fontName='Times New Roman', fontSize=15,
    leading=22, alignment=TA_LEFT, spaceBefore=14, spaceAfter=8,
    textColor=colors.HexColor('#1DB954')
)
h3_style = ParagraphStyle(
    name='H3', fontName='Times New Roman', fontSize=12,
    leading=18, alignment=TA_LEFT, spaceBefore=10, spaceAfter=6,
    textColor=colors.HexColor('#333333')
)
body_style = ParagraphStyle(
    name='Body', fontName='Times New Roman', fontSize=10.5,
    leading=17, alignment=TA_JUSTIFY, spaceAfter=8
)
body_left_style = ParagraphStyle(
    name='BodyLeft', fontName='Times New Roman', fontSize=10.5,
    leading=17, alignment=TA_LEFT, spaceAfter=8
)
code_style = ParagraphStyle(
    name='Code', fontName='DejaVuSans', fontSize=8.5,
    leading=12, alignment=TA_LEFT, spaceAfter=6,
    backColor=colors.HexColor('#F5F5F5'), leftIndent=10, rightIndent=10,
    spaceBefore=4
)
caption_style = ParagraphStyle(
    name='Caption', fontName='Times New Roman', fontSize=9.5,
    leading=14, alignment=TA_CENTER, textColor=colors.HexColor('#555555'),
    spaceBefore=3, spaceAfter=6
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='Times New Roman', fontSize=10.5,
    leading=17, alignment=TA_LEFT, spaceAfter=4, leftIndent=20, bulletIndent=8
)

# Table styles
th_style = ParagraphStyle(
    name='TH', fontName='Times New Roman', fontSize=9.5,
    leading=13, alignment=TA_CENTER, textColor=colors.white
)
td_style = ParagraphStyle(
    name='TD', fontName='Times New Roman', fontSize=9,
    leading=13, alignment=TA_LEFT, textColor=colors.black
)
td_center = ParagraphStyle(
    name='TDCenter', fontName='Times New Roman', fontSize=9,
    leading=13, alignment=TA_CENTER, textColor=colors.black
)
td_code = ParagraphStyle(
    name='TDCode', fontName='DejaVuSans', fontSize=7.5,
    leading=11, alignment=TA_LEFT, textColor=colors.HexColor('#333333')
)

# TOC styles
toc_h1 = ParagraphStyle(name='TOCH1', fontSize=13, leftIndent=20, fontName='Times New Roman', leading=22, spaceBefore=6)
toc_h2 = ParagraphStyle(name='TOCH2', fontSize=11, leftIndent=40, fontName='Times New Roman', leading=18, spaceBefore=3)

# ==================== DOC TEMPLATE ====================
class TocDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            self.notify('TOCEntry', (level, text, self.page))

pdf_path = '/home/z/my-project/download/Spotify_Frontend_Analysis_Report.pdf'
doc = TocDocTemplate(
    pdf_path, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm, topMargin=2.2*cm, bottomMargin=2.2*cm,
    title='Spotify Frontend Analysis Report',
    author='Z.ai', creator='Z.ai',
    subject='Comprehensive frontend analysis of Spotify Web Player (open.spotify.com)'
)

story = []

def add_heading(text, style, level=0):
    p = Paragraph(text, style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text.replace('<b>', '').replace('</b>', '')
    return p

def make_table(data, col_widths, caption_text=None):
    elements = []
    t = Table(data, colWidths=col_widths, repeatRows=1)
    row_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        row_styles.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(row_styles))
    elements.append(Spacer(1, 18))
    elements.append(t)
    if caption_text:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(caption_text, caption_style))
    elements.append(Spacer(1, 18))
    return elements

# ==================== COVER PAGE ====================
story.append(Spacer(1, 100))
story.append(Paragraph('<b>Spotify Web Player</b>', cover_title_style))
story.append(Spacer(1, 12))
story.append(Paragraph('<b>Frontend Analysis Report</b>', ParagraphStyle(
    name='CoverTitle2', fontName='Times New Roman', fontSize=30,
    leading=38, alignment=TA_CENTER, textColor=colors.HexColor('#1DB954')
)))
story.append(Spacer(1, 36))
story.append(Paragraph('Comprehensive extraction and analysis of the frontend architecture,<br/>components, styles, and technologies used in open.spotify.com', cover_subtitle_style))
story.append(Spacer(1, 48))
story.append(Paragraph('URL Analyzed: https://open.spotify.com/intl-es/', cover_author_style))
story.append(Paragraph('Client Version: 1.2.87.404.g6f180652', cover_author_style))
story.append(Paragraph('Build Date: 2026-04-02', cover_author_style))
story.append(Spacer(1, 60))
story.append(Paragraph('Generated by Z.ai', cover_author_style))
story.append(Paragraph('April 3, 2026', cover_author_style))
story.append(PageBreak())

# ==================== TABLE OF CONTENTS ====================
story.append(Paragraph('<b>Table of Contents</b>', ParagraphStyle(
    name='TOCTitle', fontName='Times New Roman', fontSize=22,
    leading=30, alignment=TA_LEFT, spaceAfter=18, textColor=colors.black
)))
story.append(Spacer(1, 12))
toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# ==================== 1. OVERVIEW ====================
story.append(add_heading('<b>1. Overview</b>', h1_style, 0))

story.append(Paragraph(
    'This report presents a comprehensive analysis of the frontend architecture of the Spotify Web Player, '
    'specifically the international Spanish landing page at open.spotify.com/intl-es/. The analysis covers '
    'all aspects of the frontend implementation, including the HTML structure, CSS styling system, JavaScript '
    'bundle architecture, CDN infrastructure, font system, third-party integrations, accessibility features, '
    'and server-side configuration. The Spotify Web Player is one of the most sophisticated single-page '
    'applications (SPA) on the internet, serving hundreds of millions of users globally with a highly '
    'optimized, performant, and accessible web experience.',
    body_style
))

story.append(Paragraph(
    'The web player is built using React as its core UI framework, styled-components (version 5.3.11) for '
    'CSS-in-JS styling, and a custom design system called "Encore" that provides a consistent visual language '
    'across all Spotify platforms. The application follows a micro-frontend architecture with code splitting, '
    'lazy loading, and a sophisticated caching strategy. The total HTML payload analyzed comprises approximately '
    '440,042 characters, indicating a complex, feature-rich application with significant server-side rendering '
    'to ensure fast initial page loads and optimal search engine optimization.',
    body_style
))

story.append(Paragraph(
    'The platform leverages an extensive CDN network with over 16 preconnected domains, 16 prefetched resources, '
    'and 5 preloaded critical assets. The application demonstrates advanced performance optimization techniques '
    'including resource hints (preconnect, prefetch, preload), lazy loading for 56 images, and strategic code '
    'splitting across multiple JavaScript bundles. The design system uses a dark theme by default with extensive '
    'custom CSS properties for theming, and includes a proprietary font family called "Spotify Mix" with four '
    'distinct weight variants optimized for both Latin and CJK character sets.',
    body_style
))

# ==================== 2. HTML STRUCTURE ====================
story.append(add_heading('<b>2. HTML Structure and Layout</b>', h1_style, 0))

story.append(add_heading('<b>2.1 Document Metadata</b>', h2_style, 1))

story.append(Paragraph(
    'The HTML document is declared with the lang="en" attribute and dir="ltr" direction, despite being accessed '
    'through the /intl-es/ path. This indicates that the locale detection is handled client-side rather than '
    'through server-side HTML attributes. The document includes comprehensive meta tags for SEO, social sharing, '
    'and browser compatibility. The title is set to "Spotify - Web Player: Music for everyone" which serves both '
    'as a brand identifier and a descriptive page title for search engines.',
    body_style
))

meta_data = [
    [Paragraph('<b>Attribute</b>', th_style), Paragraph('<b>Value</b>', th_style)],
    [Paragraph('Character Set', td_style), Paragraph('UTF-8', td_style)],
    [Paragraph('X-UA-Compatible', td_style), Paragraph('IE=9', td_style)],
    [Paragraph('Viewport', td_style), Paragraph('width=device-width, initial-scale=1, maximum-scale=1', td_style)],
    [Paragraph('OG:Site Name', td_style), Paragraph('Spotify', td_style)],
    [Paragraph('FB:App ID', td_style), Paragraph('174829003346', td_style)],
    [Paragraph('Canonical URL', td_style), Paragraph('https://open.spotify.com/', td_style)],
    [Paragraph('Theme Class', td_style), Paragraph('encore-dark-theme', td_style)],
    [Paragraph('Layout Class', td_style), Paragraph('centered-layout', td_style)],
    [Paragraph('OS Detection', td_style), Paragraph('spotify__os--is-macos', td_style)],
    [Paragraph('Container Class', td_style), Paragraph('spotify__container--is-web', td_style)],
]
for el in make_table(meta_data, [4*cm, 12.5*cm], '<b>Table 1.</b> Document Metadata and HTML Attributes'):
    story.append(el)

story.append(add_heading('<b>2.2 Semantic Structure</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player follows a well-organized semantic HTML structure that leverages modern HTML5 '
    'elements for accessibility and SEO purposes. The main layout is composed of a root div with the test ID '
    '"root" and classes "Root global-nav centered-layout", using CSS custom properties for dynamic spacing '
    '(--panel-gap: 8px; --zoom-level: 100). The application uses multiple semantic tags including nav, header, '
    'main, section, aside, and footer elements to create a clear document outline that screen readers and search '
    'engine crawlers can easily parse.',
    body_style
))

story.append(Paragraph(
    'The page structure reveals a classic web application layout with a global navigation bar at the top, a '
    'sidebar library panel on the left, a main content area in the center, and a persistent now-playing bar '
    'at the bottom. Additionally, there is a lyrics cinema overlay (id="lyrics-cinema") and a root dialogs '
    'container for modals. The application makes extensive use of ARIA attributes with over 700 aria-* attribute '
    'instances across the page, demonstrating a strong commitment to web accessibility standards.',
    body_style
))

tag_data = [
    [Paragraph('<b>Tag</b>', th_style), Paragraph('<b>Count</b>', th_style), Paragraph('<b>Purpose</b>', th_style)],
    [Paragraph('div', td_center), Paragraph('1,174', td_center), Paragraph('Primary layout container', td_style)],
    [Paragraph('span', td_center), Paragraph('584', td_center), Paragraph('Inline text and icon wrappers', td_style)],
    [Paragraph('a (anchor)', td_center), Paragraph('339', td_center), Paragraph('Navigation links and CTAs', td_style)],
    [Paragraph('li (list item)', td_center), Paragraph('192', td_center), Paragraph('List items (library, menus)', td_style)],
    [Paragraph('button', td_center), Paragraph('145', td_center), Paragraph('Interactive controls', td_style)],
    [Paragraph('svg', td_center), Paragraph('92', td_center), Paragraph('Icon system (Encore icons)', td_style)],
    [Paragraph('p (paragraph)', td_center), Paragraph('73', td_center), Paragraph('Text paragraphs', td_style)],
    [Paragraph('img (image)', td_center), Paragraph('59', td_center), Paragraph('Album art, artist images', td_style)],
    [Paragraph('input', td_center), Paragraph('18', td_center), Paragraph('Search, form inputs', td_style)],
    [Paragraph('section', td_center), Paragraph('13', td_center), Paragraph('Content sections', td_style)],
    [Paragraph('script', td_center), Paragraph('21', td_center), Paragraph('JavaScript resources', td_style)],
    [Paragraph('template', td_center), Paragraph('5', td_center), Paragraph('Reusable DOM templates', td_style)],
]
for el in make_table(tag_data, [2.5*cm, 2*cm, 12*cm], '<b>Table 2.</b> HTML Element Usage Summary'):
    story.append(el)

story.append(add_heading('<b>2.3 Accessibility (ARIA)</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player demonstrates a strong commitment to web accessibility through extensive use of '
    'ARIA (Accessible Rich Internet Applications) attributes. The application contains over 700 ARIA attribute '
    'instances, with aria-hidden being the most frequently used (247 instances) to manage screen reader visibility '
    'of decorative elements and icons. This level of ARIA implementation is consistent with WCAG 2.1 AA compliance '
    'standards and ensures that users with visual impairments can navigate the application effectively using assistive '
    'technologies such as screen readers and voice control software.',
    body_style
))

story.append(Paragraph(
    'The application includes 125 aria-labelledby attributes and 119 aria-describedby attributes, which provide '
    'rich contextual information for screen reader users by associating elements with their descriptive labels. '
    'Additionally, 108 aria-label attributes provide direct text labels for interactive elements that lack visible '
    'text. The application also uses aria-expanded (23 instances) for collapsible sections, aria-disabled (63 instances) '
    'for state management, and aria-level (25 instances) for heading hierarchy communication. The presence of '
    'aria-checked, aria-controls, aria-modal, and aria-owns further demonstrates sophisticated accessibility '
    'patterns for complex interactive widgets.',
    body_style
))

aria_data = [
    [Paragraph('<b>ARIA Attribute</b>', th_style), Paragraph('<b>Count</b>', th_style), Paragraph('<b>Usage Context</b>', th_style)],
    [Paragraph('aria-hidden', td_style), Paragraph('247', td_center), Paragraph('Decorative icons, off-screen content', td_style)],
    [Paragraph('aria-labelledby', td_style), Paragraph('125', td_center), Paragraph('Section titles, form labels', td_style)],
    [Paragraph('aria-describedby', td_style), Paragraph('119', td_center), Paragraph('Context descriptions, help text', td_style)],
    [Paragraph('aria-label', td_style), Paragraph('108', td_center), Paragraph('Button labels, link descriptions', td_style)],
    [Paragraph('aria-disabled', td_style), Paragraph('63', td_center), Paragraph('Inactive controls, loading states', td_style)],
    [Paragraph('aria-colindex', td_style), Paragraph('56', td_center), Paragraph('Grid/table column positions', td_style)],
    [Paragraph('aria-level', td_style), Paragraph('25', td_center), Paragraph('Heading levels, tree depth', td_style)],
    [Paragraph('aria-expanded', td_style), Paragraph('23', td_center), Paragraph('Collapsible panels, dropdowns', td_style)],
    [Paragraph('aria-checked', td_style), Paragraph('4', td_center), Paragraph('Toggle switches, checkboxes', td_style)],
    [Paragraph('aria-modal', td_style), Paragraph('3', td_center), Paragraph('Dialog modals', td_style)],
    [Paragraph('aria-controls', td_style), Paragraph('3', td_center), Paragraph('Associated UI controls', td_style)],
]
for el in make_table(aria_data, [3.5*cm, 2*cm, 11*cm], '<b>Table 3.</b> ARIA Attribute Usage'):
    story.append(el)

# ==================== 3. CSS ====================
story.append(add_heading('<b>3. CSS Architecture and Styling System</b>', h1_style, 0))

story.append(add_heading('<b>3.1 CSS-in-JS: Styled Components</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player uses styled-components version 5.3.11 as its primary CSS-in-JS solution. This is '
    "evidenced by the presence of two style[data-styled='active'] tags in the document head, which are "
    'injected by the styled-components runtime at build time. The choice of styled-components enables Spotify to '
    'maintain a highly modular styling system where styles are co-located with components, preventing class name '
    'collisions and enabling dynamic theming based on user preferences and application state.',
    body_style
))

story.append(Paragraph(
    'In addition to styled-components, the application also uses goober, a lightweight CSS-in-JS library, for '
    'specific components. This is evident from the 26 inline goober-generated CSS rules found in the document, '
    'all prefixed with the "go" class namespace (e.g., .go1475592160, .go1671063245). Goober is notably smaller '
    'than styled-components (approximately 1KB vs 12KB), making it suitable for performance-critical components '
    'where bundle size matters. The combination of both libraries suggests a deliberate architectural decision to '
    'use the right tool for each specific use case within the application.',
    body_style
))

story.append(add_heading('<b>3.2 CSS Bundle Files</b>', h2_style, 1))

story.append(Paragraph(
    'The application loads 18 distinct CSS files from the Spotify CDN, each corresponding to a specific feature '
    'module or route. This granular approach to CSS splitting ensures that only the styles needed for the current '
    'view are loaded, significantly reducing the initial CSS payload. The naming convention follows a clear pattern: '
    '"dwp-" prefix for desktop web player components, "xpui-routes-" for route-specific styles, and hash-based '
    'cache busting suffixes for each file. The main web-player CSS bundle (web-player.83d2f05c.css) serves as the '
    'core stylesheet, while feature-specific stylesheets are loaded on demand as users navigate through the application.',
    body_style
))

css_data = [
    [Paragraph('<b>CSS File</b>', th_style), Paragraph('<b>Module/Purpose</b>', th_style)],
    [Paragraph('web-player.83d2f05c.css', td_code), Paragraph('Core application styles', td_style)],
    [Paragraph('dwp-top-bar.0ec3bbd9.css', td_code), Paragraph('Top navigation bar', td_style)],
    [Paragraph('dwp-home-header.0ec3bbd9.css', td_code), Paragraph('Home page header section', td_style)],
    [Paragraph('dwp-now-playing-bar.41972fd4.css', td_code), Paragraph('Persistent bottom player bar', td_style)],
    [Paragraph('dwp-feedback-bar.931ea758.css', td_code), Paragraph('User feedback component', td_style)],
    [Paragraph('dwp-home-chips-row.fb404ad3.css', td_code), Paragraph('Genre/mood chip filters', td_style)],
    [Paragraph('dwp-panel-section.a53934ff.css', td_code), Paragraph('Collapsible panel sections', td_style)],
    [Paragraph('dwp-video-player.53b9ad7d.css', td_code), Paragraph('Video/podcast player', td_style)],
    [Paragraph('dwp-watch-feed-view-container.f0765aa5.css', td_code), Paragraph('Video feed layout', td_style)],
    [Paragraph('xpui-routes-your-library-x.ea3af739.css', td_code), Paragraph('Library sidebar', td_style)],
    [Paragraph('xpui-routes-search.e32690de.css', td_code), Paragraph('Search page', td_style)],
    [Paragraph('xpui-routes-offline-browse.fc5bdd6c.css', td_code), Paragraph('Offline browsing mode', td_style)],
    [Paragraph('xpui-root-dialogs.5d7da843.css', td_code), Paragraph('Modal dialog system', td_style)],
    [Paragraph('dwp-page-error-template.5481174c.css', td_code), Paragraph('Error page template', td_style)],
    [Paragraph('dwp-offline-empty-state.914ad547.css', td_code), Paragraph('Offline empty state', td_style)],
    [Paragraph('listening-stats-modal.e46fcd5c.css', td_code), Paragraph('Listening statistics modal', td_style)],
    [Paragraph('home-hpto.66185990.css', td_code), Paragraph('Home hero/takeover banner', td_style)],
    [Paragraph('2642.a902f130.css', td_code), Paragraph('Shared component styles', td_style)],
]
for el in make_table(css_data, [7.5*cm, 9*cm], '<b>Table 4.</b> Complete CSS Bundle Inventory'):
    story.append(el)

story.append(add_heading('<b>3.3 Encore Design System</b>', h2_style, 1))

story.append(Paragraph(
    'The Encore design system is Spotify\'s proprietary design language that provides a unified visual framework '
    'across all client platforms including web, iOS, Android, desktop, and embedded devices. On the web player, '
    'Encore manifests through CSS utility classes that follow the naming convention "encore-{category}-{variant}". '
    'The system covers typography, color tokens, spacing, layout, and theming. The application uses two theme '
    'variants: "encore-dark-theme" (default) and "encore-inverted-set" for specific high-contrast elements.',
    body_style
))

encore_data = [
    [Paragraph('<b>Class</b>', th_style), Paragraph('<b>Category</b>', th_style), Paragraph('<b>Description</b>', th_style)],
    [Paragraph('encore-dark-theme', td_code), Paragraph('Theme', td_style), Paragraph('Primary dark mode theme applied to root', td_style)],
    [Paragraph('encore-bright-accent-set', td_code), Paragraph('Color', td_style), Paragraph('Bright accent color palette (green CTAs)', td_style)],
    [Paragraph('encore-inverted-light-set', td_code), Paragraph('Color', td_style), Paragraph('Inverted light color tokens', td_style)],
    [Paragraph('encore-inverted-set', td_code), Paragraph('Color', td_style), Paragraph('General inverted color set', td_style)],
    [Paragraph('encore-internal-color-text-base', td_code), Paragraph('Color', td_style), Paragraph('Base text color (#FFFFFF on dark)', td_style)],
    [Paragraph('encore-internal-color-text-subdued', td_code), Paragraph('Color', td_style), Paragraph('Subdued/muted text color', td_style)],
    [Paragraph('encore-internal-color-essential-subdued', td_code), Paragraph('Color', td_style), Paragraph('Essential subdued elements', td_style)],
    [Paragraph('encore-text-title-small', td_code), Paragraph('Typography', td_style), Paragraph('Small title text style', td_style)],
    [Paragraph('encore-text-body-medium', td_code), Paragraph('Typography', td_style), Paragraph('Medium body text style', td_style)],
    [Paragraph('encore-text-body-medium-bold', td_code), Paragraph('Typography', td_style), Paragraph('Bold medium body text', td_style)],
    [Paragraph('encore-text-body-small', td_code), Paragraph('Typography', td_style), Paragraph('Small body text style', td_style)],
    [Paragraph('encore-text-body-small-bold', td_code), Paragraph('Typography', td_style), Paragraph('Bold small body text', td_style)],
    [Paragraph('encore-text-marginal', td_code), Paragraph('Typography', td_style), Paragraph('Marginal/caption text', td_style)],
    [Paragraph('encore-text-marginal-bold', td_code), Paragraph('Typography', td_style), Paragraph('Bold marginal text', td_style)],
    [Paragraph('encore-layout-themes', td_code), Paragraph('Layout', td_style), Paragraph('Theme-aware layout system', td_style)],
    [Paragraph('encore-internal-padding-block-end-tighter-2', td_code), Paragraph('Spacing', td_style), Paragraph('Tighter bottom padding token', td_style)],
]
for el in make_table(encore_data, [6*cm, 2*cm, 8.5*cm], '<b>Table 5.</b> Encore Design System CSS Classes'):
    story.append(el)

# ==================== 4. JAVASCRIPT ====================
story.append(add_heading('<b>4. JavaScript Architecture</b>', h1_style, 0))

story.append(add_heading('<b>4.1 Core Bundles</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player employs a sophisticated JavaScript bundling strategy with clear separation between '
    'vendor dependencies, the Encore design system library, and the main application code. The application loads '
    'three primary synchronous JavaScript bundles from the CDN, each serving a distinct purpose in the application '
    'architecture. Additionally, 16 JavaScript files are prefetched for subsequent routes, ensuring near-instant '
    'navigation when users move between different sections of the application.',
    body_style
))

story.append(Paragraph(
    'The vendor bundle (vendor~web-player.8d647cb6.js) contains all third-party library dependencies including '
    'React, React DOM, and other utility libraries. The Encore bundle (encore~web-player.f7595fde.js) contains '
    'the design system components and utilities that power the visual framework. The main application bundle '
    '(web-player.f0119d22.js) contains the core application logic, routing, state management, and feature '
    'implementations. This three-bundle split allows for efficient caching, as vendor and Encore bundles change '
    'less frequently than the application code and can be cached independently by the browser.',
    body_style
))

js_data = [
    [Paragraph('<b>Bundle</b>', th_style), Paragraph('<b>Type</b>', th_style), Paragraph('<b>Description</b>', th_style)],
    [Paragraph('vendor~web-player.8d647cb6.js', td_code), Paragraph('Sync', td_center), Paragraph('Third-party dependencies (React, etc.)', td_style)],
    [Paragraph('encore~web-player.f7595fde.js', td_code), Paragraph('Sync', td_center), Paragraph('Encore design system components', td_style)],
    [Paragraph('web-player.f0119d22.js', td_code), Paragraph('Sync', td_center), Paragraph('Core application code', td_style)],
    [Paragraph('1756.aee40ef8.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Code-split chunk #1756', td_style)],
    [Paragraph('183.13af77ad.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Code-split chunk #183', td_style)],
    [Paragraph('4726.a5d8d066.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Code-split chunk #4726', td_style)],
    [Paragraph('6667.9c07a41d.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Code-split chunk #6667', td_style)],
    [Paragraph('9889.a85e71bb.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Code-split chunk #9889', td_style)],
    [Paragraph('home-hpto.c6bfdf9c.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Home hero/takeover module', td_style)],
    [Paragraph('home-ads-container.e64bc66f.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Advertisement container', td_style)],
    [Paragraph('xpui-routes-search.96b4d93a.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Search route module', td_style)],
    [Paragraph('xpui-routes-offline-browse.28696ce5.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Offline browsing module', td_style)],
    [Paragraph('dwp-page-error-template.76a49b26.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Error page template', td_style)],
    [Paragraph('dwp-offline-empty-state.467817a7.js', td_code), Paragraph('Prefetch', td_center), Paragraph('Offline empty state view', td_style)],
]
for el in make_table(js_data, [7*cm, 2*cm, 7.5*cm], '<b>Table 6.</b> JavaScript Bundle Architecture'):
    story.append(el)

story.append(add_heading('<b>4.2 Server-Side Configuration</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player embeds critical server-side configuration directly into the HTML as base64-encoded '
    'JSON within script tags. This configuration is parsed by the client application during bootstrap to initialize '
    'the application state without additional API calls. The four configuration blocks found in the page are: '
    'appServerConfig (application settings), featureFlags (feature toggle system), seoExperiments (SEO A/B testing), '
    'and remoteConfig (remote feature configuration with experiment group assignments).',
    body_style
))

config_data = [
    [Paragraph('<b>Config Block</b>', th_style), Paragraph('<b>Key Parameters</b>', th_style), Paragraph('<b>Values</b>', th_style)],
    [Paragraph('appServerConfig', td_style), Paragraph('appName', td_style), Paragraph('web_player_prototype', td_style)],
    [Paragraph('', td_style), Paragraph('market', td_style), Paragraph('US', td_style)],
    [Paragraph('', td_style), Paragraph('locale', td_style), Paragraph('en (LTR)', td_style)],
    [Paragraph('', td_style), Paragraph('isPremium', td_style), Paragraph('false', td_style)],
    [Paragraph('', td_style), Paragraph('isAnonymous', td_style), Paragraph('true', td_style)],
    [Paragraph('', td_style), Paragraph('clientVersion', td_style), Paragraph('1.2.87.404.g6f180652', td_style)],
    [Paragraph('', td_style), Paragraph('buildVersion', td_style), Paragraph('open-server_2026-04-02_6f18065', td_style)],
    [Paragraph('', td_style), Paragraph('gtmId', td_style), Paragraph('GTM-PZHN3VD', td_style)],
    [Paragraph('featureFlags', td_style), Paragraph('enableShows', td_style), Paragraph('true', td_style)],
    [Paragraph('remoteConfig', td_style), Paragraph('canYourDJUserUseDesktopApp', td_style), Paragraph('true', td_style)],
    [Paragraph('', td_style), Paragraph('enableViewMode', td_style), Paragraph('true', td_style)],
    [Paragraph('', td_style), Paragraph('enableTOTPVersionValidation', td_style), Paragraph('true', td_style)],
]
for el in make_table(config_data, [3.5*cm, 5*cm, 8*cm], '<b>Table 7.</b> Server-Side Configuration (Decoded from Base64)'):
    story.append(el)

story.append(add_heading('<b>4.3 Third-Party Scripts and Integrations</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player integrates with numerous third-party services for analytics, advertising, security, '
    'and functionality enhancement. The application loads 16 external JavaScript files from various domains, each '
    'serving a specific purpose. Google Tag Manager serves as the primary tag management platform, coordinating '
    'analytics and advertising pixels. Google reCAPTCHA Enterprise provides fraud protection for user interactions. '
    'OneTrust (Cookielaw) manages cookie consent compliance with GDPR and CCPA regulations. The Cast SDK enables '
    'Chromecast streaming functionality. Fastly Insights provides real-time performance monitoring.',
    body_style
))

scripts_data = [
    [Paragraph('<b>Script</b>', th_style), Paragraph('<b>Purpose</b>', th_style), Paragraph('<b>Domain</b>', th_style)],
    [Paragraph('GTM (gtm.js)', td_style), Paragraph('Tag management', td_center), Paragraph('googletagmanager.com', td_style)],
    [Paragraph('GTM Custom (gtm.96d60fd6.js)', td_style), Paragraph('Custom GTM config', td_center), Paragraph('open.spotifycdn.com', td_style)],
    [Paragraph('Retargeting Pixels', td_style), Paragraph('Ad retargeting', td_center), Paragraph('open.spotifycdn.com', td_style)],
    [Paragraph('reCAPTCHA Enterprise', td_style), Paragraph('Fraud protection', td_center), Paragraph('google.com', td_style)],
    [Paragraph('OneTrust SDK Stub', td_style), Paragraph('Cookie consent', td_center), Paragraph('cookielaw.org', td_style)],
    [Paragraph('OneTrust Banner SDK', td_style), Paragraph('Consent banner UI', td_center), Paragraph('cookielaw.org', td_style)],
    [Paragraph('Cast Framework', td_style), Paragraph('Chromecast support', td_center), Paragraph('gstatic.com', td_style)],
    [Paragraph('Cast Sender (Eureka)', td_style), Paragraph('Cast sender protocol', td_center), Paragraph('gstatic.com', td_style)],
    [Paragraph('Pixel Sync', td_style), Paragraph('Analytics tracking', td_center), Paragraph('pixel-static.spotify.com', td_style)],
    [Paragraph('Fastly Insights', td_style), Paragraph('Performance monitoring', td_center), Paragraph('fastly-insights.com', td_style)],
    [Paragraph('Scorecard Research', td_style), Paragraph('Audience measurement', td_center), Paragraph('scorecardresearch.com', td_style)],
]
for el in make_table(scripts_data, [5*cm, 3.5*cm, 8*cm], '<b>Table 8.</b> Third-Party Script Integrations'):
    story.append(el)

# ==================== 5. FONTS ====================
story.append(add_heading('<b>5. Typography and Font System</b>', h1_style, 0))

story.append(Paragraph(
    'Spotify uses a custom proprietary font family called "Spotify Mix" across all its platforms, including '
    'the web player. This font family is designed specifically for Spotify and is optimized for readability '
    'at various sizes, weights, and screen resolutions. The web player preloads four distinct font files from '
    'the encore.scdn.co CDN, each serving a specific typographic purpose within the design system. All fonts '
    'use the WOFF2 format, which provides excellent compression ratios (typically 30-50% smaller than WOFF) '
    'and is supported by all modern browsers.',
    body_style
))

story.append(Paragraph(
    'The font loading strategy is optimized for performance with all four font files preloaded using the '
    'link rel="preload" directive, ensuring they are available before the browser begins rendering '
    'text content. This prevents the Flash of Unstyled Text (FOUT) and Flash of Invisible Text (FOIT) issues '
    'that commonly affect web performance. The fonts are loaded with crossorigin="anonymous" to enable proper '
    'CORS handling for cross-origin font requests, and each preload is accompanied by a type="font/woff2" '
    'declaration to help the browser prioritize the download of these critical rendering resources.',
    body_style
))

font_data = [
    [Paragraph('<b>Font Name</b>', th_style), Paragraph('<b>Weight/Style</b>', th_style), Paragraph('<b>Format</b>', th_style), Paragraph('<b>Usage</b>', th_style)],
    [Paragraph('SpotifyMixUI-Regular', td_style), Paragraph('Regular (400)', td_center), Paragraph('WOFF2', td_center), Paragraph('Body text, UI elements', td_style)],
    [Paragraph('SpotifyMixUI-Bold', td_style), Paragraph('Bold (700)', td_center), Paragraph('WOFF2', td_center), Paragraph('Headings, emphasis, CTAs', td_style)],
    [Paragraph('SpotifyMixUITitleVariable', td_style), Paragraph('Variable Weight', td_center), Paragraph('WOFF2', td_center), Paragraph('Page titles, hero text', td_style)],
    [Paragraph('SpotifyMixMono-Regular', td_style), Paragraph('Regular (400)', td_center), Paragraph('WOFF2', td_center), Paragraph('Code, timestamps, metadata', td_style)],
]
for el in make_table(font_data, [4.5*cm, 3*cm, 2*cm, 7*cm], '<b>Table 9.</b> Spotify Mix Font Family'):
    story.append(el)

# ==================== 6. CDN & PERFORMANCE ====================
story.append(add_heading('<b>6. CDN Infrastructure and Performance</b>', h1_style, 0))

story.append(add_heading('<b>6.1 CDN Network</b>', h2_style, 1))

story.append(Paragraph(
    'Spotify operates an extensive content delivery network (CDN) infrastructure to ensure fast and reliable '
    'content delivery to users worldwide. The web player establishes preconnections to 16 distinct domains, '
    'each serving a specific purpose within the application architecture. This multi-CDN approach allows Spotify '
    'to optimize delivery for different content types: static assets from open.spotifycdn.com, user-generated '
    'images from i.scdn.co, mosaic collages from mosaic.scdn.co, chart images from charts-images.scdn.co, and '
    'dynamic content from various Spotify API endpoints.',
    body_style
))

cdn_data = [
    [Paragraph('<b>Domain</b>', th_style), Paragraph('<b>Purpose</b>', th_style), Paragraph('<b>Content Type</b>', th_style)],
    [Paragraph('open.spotifycdn.com', td_style), Paragraph('Primary CDN', td_center), Paragraph('JS, CSS, fonts, manifest', td_style)],
    [Paragraph('i.scdn.co', td_style), Paragraph('Image CDN', td_center), Paragraph('Album art, artist images', td_style)],
    [Paragraph('mosaic.scdn.co', td_style), Paragraph('Mosaic Generator', td_center), Paragraph('Playlist/album mosaic images', td_style)],
    [Paragraph('lineup-images.scdn.co', td_style), Paragraph('Lineup Images', td_center), Paragraph('Episode/show artwork', td_style)],
    [Paragraph('daily-mix.scdn.co', td_style), Paragraph('Daily Mix Assets', td_center), Paragraph('Daily mix cover art', td_style)],
    [Paragraph('pl.scdn.co', td_style), Paragraph('Playlist CDN', td_center), Paragraph('Playlist-related images', td_style)],
    [Paragraph('encore.scdn.co', td_style), Paragraph('Design System CDN', td_center), Paragraph('Encore fonts, icons', td_style)],
    [Paragraph('pickasso.spotifycdn.com', td_style), Paragraph('Dynamic Images', td_center), Paragraph('Radio/artist generated images', td_style)],
    [Paragraph('charts-images.scdn.co', td_style), Paragraph('Charts CDN', td_center), Paragraph('Charts banner images', td_style)],
    [Paragraph('api.spotify.com', td_style), Paragraph('Main API', td_center), Paragraph('Core API endpoints', td_style)],
    [Paragraph('api-partner.spotify.com', td_style), Paragraph('Partner API', td_center), Paragraph('Third-party integrations', td_style)],
    [Paragraph('spclient.wg.spotify.com', td_style), Paragraph('Web Client API', td_center), Paragraph('Client-specific data', td_style)],
    [Paragraph('gue1-spclient.spotify.com', td_style), Paragraph('Edge Client', td_center), Paragraph('Edge-routed client data', td_style)],
    [Paragraph('clienttoken.spotify.com', td_style), Paragraph('Auth Tokens', td_center), Paragraph('Client authentication', td_style)],
    [Paragraph('pixel.spotify.com', td_style), Paragraph('Analytics Pixel', td_center), Paragraph('User behavior tracking', td_style)],
    [Paragraph('pixel-static.spotify.com', td_style), Paragraph('Static Analytics', td_center), Paragraph('Analytics sync script', td_style)],
]
for el in make_table(cdn_data, [5.5*cm, 3*cm, 8*cm], '<b>Table 10.</b> CDN Domain Inventory'):
    story.append(el)

story.append(add_heading('<b>6.2 Performance Optimization</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player implements a comprehensive set of performance optimization techniques designed to '
    'minimize load times and maximize perceived performance. The application employs a multi-layered strategy '
    'that includes resource hints (16 prefetches, 5 preloads, 16 preconnects), lazy loading for 56 images '
    '(using loading="lazy"), code splitting with 14 prefetched JavaScript chunks, CSS modular loading with '
    '18 feature-specific stylesheets, and strategic font preloading for 4 custom fonts. The application also '
    'uses a custom scrollbar implementation (OverlayScrollbars) for consistent cross-browser scrolling behavior, '
    'and implements a Picture-in-Picture (PiP) mini-player with its own dedicated CSS and JS bundles.',
    body_style
))

perf_data = [
    [Paragraph('<b>Technique</b>', th_style), Paragraph('<b>Count</b>', th_style), Paragraph('<b>Details</b>', th_style)],
    [Paragraph('Preconnect', td_style), Paragraph('16', td_center), Paragraph('Early TCP/TLS handshake with API and CDN domains', td_style)],
    [Paragraph('Prefetch', td_style), Paragraph('16', td_center), Paragraph('Pre-fetched JS chunks and CSS for route transitions', td_style)],
    [Paragraph('Preload', td_style), Paragraph('5', td_center), Paragraph('Critical fonts (4) and locale JSON (1)', td_style)],
    [Paragraph('Lazy Loading', td_style), Paragraph('56', td_center), Paragraph('Images with loading="lazy" attribute', td_style)],
    [Paragraph('Code Splitting', td_style), Paragraph('14+', td_center), Paragraph('Separate JS chunks for routes and features', td_style)],
    [Paragraph('CSS Splitting', td_style), Paragraph('18', td_center), Paragraph('Feature-specific CSS bundles', td_style)],
    [Paragraph('PiP Resources', td_style), Paragraph('3', td_center), Paragraph('Dedicated mini-player CSS and JS bundles', td_style)],
]
for el in make_table(perf_data, [3*cm, 2*cm, 11.5*cm], '<b>Table 11.</b> Performance Optimization Techniques'):
    story.append(el)

# ==================== 7. COMPONENTS ====================
story.append(add_heading('<b>7. Component Architecture and Data Attributes</b>', h1_style, 0))

story.append(Paragraph(
    'The Spotify Web Player follows a component-based architecture built on React, with components identified '
    'and testable through a comprehensive data attribute system. The most prominent identifier system uses '
    'data-testid attributes (256 instances) for end-to-end testing with tools like Cypress or Playwright. '
    'Additionally, the application uses data-encore-id attributes (662 instances) as component identifiers '
    'within the Encore design system, providing a bridge between the visual design system and the component '
    'implementation layer.',
    body_style
))

story.append(Paragraph(
    'The carousel system is a major UI pattern, evidenced by 56 data-carousel-item attributes and 56 '
    'data-carousel-gridlist-item attributes, indicating horizontal scrolling content sections for album '
    'and playlist recommendations. The data-ga-category and data-ga-action attributes (18 instances each) '
    'enable comprehensive Google Analytics event tracking for user interactions. The data-shelf attributes (5 '
    'instances) identify content shelf sections that group related content together. The application also includes '
    'a data-rac (React Aria Components) system with 61 instances, indicating integration with Adobe\'s React '
    'Aria library for accessible UI components.',
    body_style
))

comp_data = [
    [Paragraph('<b>Data Attribute</b>', th_style), Paragraph('<b>Count</b>', th_style), Paragraph('<b>Purpose</b>', th_style)],
    [Paragraph('data-encore-id', td_style), Paragraph('662', td_center), Paragraph('Encore design system component IDs', td_style)],
    [Paragraph('data-testid', td_style), Paragraph('256', td_center), Paragraph('End-to-end test identifiers', td_style)],
    [Paragraph('data-rac', td_style), Paragraph('61', td_center), Paragraph('React Aria component markers', td_style)],
    [Paragraph('data-collection', td_style), Paragraph('61', td_center), Paragraph('Content collection grouping', td_style)],
    [Paragraph('data-is-icon-only', td_style), Paragraph('57', td_center), Paragraph('Icon-only button markers', td_style)],
    [Paragraph('data-carousel-gridlist-item', td_style), Paragraph('56', td_center), Paragraph('Carousel grid list items', td_style)],
    [Paragraph('data-carousel-item', td_style), Paragraph('56', td_center), Paragraph('Carousel content items', td_style)],
    [Paragraph('data-ga-category', td_style), Paragraph('18', td_center), Paragraph('Google Analytics event categories', td_style)],
    [Paragraph('data-ga-action', td_style), Paragraph('18', td_center), Paragraph('Google Analytics event actions', td_style)],
    [Paragraph('data-shelf', td_style), Paragraph('5', td_center), Paragraph('Content shelf section IDs', td_style)],
    [Paragraph('data-overlayscrollbars', td_style), Paragraph('2', td_center), Paragraph('Custom scrollbar initialization', td_style)],
    [Paragraph('data-layout', td_style), Paragraph('5', td_center), Paragraph('Layout configuration markers', td_style)],
]
for el in make_table(comp_data, [5.5*cm, 2*cm, 9*cm], '<b>Table 12.</b> Component Data Attributes'):
    story.append(el)

# ==================== 8. IMAGE CDN ====================
story.append(add_heading('<b>8. Image Sources and Delivery</b>', h1_style, 0))

story.append(Paragraph(
    'The Spotify Web Player uses multiple image CDN sources for different types of visual content. Album artwork '
    'and artist images are served from i.scdn.co using Spotify\'s proprietary image ID system (ab67616100005174, '
    'ab67616d00001e02 format), which allows for dynamic image resizing and format optimization at the CDN edge. '
    'Radio and artist page images use the pickasso.spotifycdn.com service, which generates dynamic images with '
    'localized overlays. Chart images are served from a dedicated charts-images.scdn.co CDN with locale-specific '
    'regional and global chart banners. All images benefit from lazy loading (56 images with loading="lazy"), '
    'reducing initial page weight and improving Time to Interactive (TTI) metric.',
    body_style
))

img_data = [
    [Paragraph('<b>CDN Source</b>', th_style), Paragraph('<b>Image Type</b>', th_style), Paragraph('<b>Example Path Pattern</b>', th_style)],
    [Paragraph('i.scdn.co', td_style), Paragraph('Album art, artist photos', td_style), Paragraph('/image/ab67616d00001e02-{hash}', td_code)],
    [Paragraph('pickasso.spotifycdn.com', td_style), Paragraph('Radio artist pages', td_style), Paragraph('/image/ab67c0de0000deef/dt/v1/img/radio/', td_code)],
    [Paragraph('charts-images.scdn.co', td_style), Paragraph('Chart banners', td_style), Paragraph('/assets/locale_en/regional/daily/', td_code)],
    [Paragraph('open.spotifycdn.com', td_style), Paragraph('App icons, favicons', td_style), Paragraph('/cdn/images/favicon{size}.{hash}.png', td_code)],
    [Paragraph('lineup-images.scdn.co', td_style), Paragraph('Podcast/show artwork', td_style), Paragraph('Show and episode images', td_style)],
]
for el in make_table(img_data, [4*cm, 4*cm, 8.5*cm], '<b>Table 13.</b> Image CDN Sources'):
    story.append(el)

# ==================== 9. SEO & SOCIAL ====================
story.append(add_heading('<b>9. SEO, Social Media, and Web App Features</b>', h1_style, 0))

story.append(add_heading('<b>9.1 SEO and Open Graph</b>', h2_style, 1))

story.append(Paragraph(
    'The Spotify Web Player implements essential SEO and social media metadata to ensure proper representation '
    'when shared on social platforms and indexed by search engines. The Open Graph protocol is used with the '
    'og:site_name property set to "Spotify" and a Facebook App ID (174829003346) for Facebook-specific '
    'integration. The canonical URL is set to https://open.spotify.com/ to consolidate link equity and prevent '
    'duplicate content issues from internationalized URLs. An OpenSearch description XML is also provided, enabling '
    'Spotify to appear as a search engine option in browser search bars.',
    body_style
))

story.append(add_heading('<b>9.2 Progressive Web App (PWA) Features</b>', h2_style, 1))

story.append(Paragraph(
    'The web player includes a Web App Manifest (manifest-web-player.1609946b.json) hosted on the Spotify CDN, '
    'enabling installation as a Progressive Web App on supported browsers and operating systems. The manifest file '
    'allows users to "install" Spotify directly from the browser, providing an app-like experience with its own '
    'window, icon, and standalone behavior. Combined with the Picture-in-Picture mini-player capability (pip-mini-player '
    'bundle) and the Chromecast integration via the Google Cast SDK, the web player provides a rich, app-like '
    'experience that rivals native desktop and mobile applications.',
    body_style
))

story.append(Paragraph(
    'The application also includes a locale preload mechanism (data-translations-url-for-locale="en") that fetches '
    'the appropriate translation file (en.26097b69.json) during page initialization. This enables server-side '
    'rendering with the correct locale while allowing client-side locale switching without a full page reload. '
    'The combination of these PWA features, i18n support, and the extensive ARIA implementation makes the Spotify '
    'Web Player one of the most technically sophisticated and accessible music streaming web applications available.',
    body_style
))

# ==================== BUILD ====================
doc.multiBuild(story)
print(f"PDF generated at: {pdf_path}")
