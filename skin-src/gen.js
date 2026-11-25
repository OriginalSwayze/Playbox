// KESTREL SKIN — the Millennium theme that dresses everything the Kestrel plugin shows natively:
// Steam's own pages inside the window (classic game page, downloads), dialogs, menus, notifications,
// the friends and chat windows, sign-in, and the Store and Community web pages.
// Build: node skin-src/gen.js && node "<Steam Theme Builder>/kit/build.js" skin-src   (writes into skin/ via the themes junction)
const fs = require('fs');
const path = require('path');
const D = __dirname;
const w = (p, s) => { fs.mkdirSync(path.dirname(D + '/' + p), { recursive: true }); fs.writeFileSync(D + '/' + p, s.trim() + '\n'); };
const o = (src, aff = ['.*']) => ({ TargetCss: { affects: aff, src } });

// ---------------------------------------------------------------------------------------------
w('tokens.css', `/* KESTREL — tokens (shared with the plugin: night ink, warm paper text, kestrel amber). */
:root {
    --ks-ink: #08090C; --ks-s1: #0E1015; --ks-s2: #141720; --ks-s3: #1C202B; --ks-s4: #262B38;
    --ks-line: rgba(236,232,222,.07); --ks-line-2: rgba(236,232,222,.13);
    --ks-fg: #F2EFE8; --ks-fg-2: #A9AAB2; --ks-fg-3: #6F727D;
    --ks-accent: #F0A23B; --ks-accent-2: #FFCB7A; --ks-on: #1A1004; --ks-cool: #8DB4FF; --ks-ok: #5FD39A;
    --ks-a10: rgba(240,162,59,.10); --ks-a20: rgba(240,162,59,.20); --ks-a40: rgba(240,162,59,.40);
    --ks-grad: linear-gradient(180deg, var(--ks-accent-2), var(--ks-accent));
    --ks-edge: inset 0 0 0 1px var(--ks-line);
    --ks-display: "Segoe UI Variable Display", "Segoe UI", sans-serif;
    --ks-text: "Segoe UI Variable Text", "Segoe UI", sans-serif;
    --ks-small: "Segoe UI Variable Small", "Segoe UI", sans-serif;
    --ks-out: cubic-bezier(.16, 1, .3, 1);
    --ks-spring: cubic-bezier(.34, 1.36, .5, 1);

    --t-accent: var(--ks-accent); --t-accent-2: var(--ks-accent-2); --t-alert: #FF7A66;
    --t-bg: var(--ks-ink); --t-panel: var(--ks-s1); --t-ink: var(--ks-on);
    --t-fg: var(--ks-fg); --t-fg-2: var(--ks-fg-2); --t-fg-3: var(--ks-fg-3); --t-fg-4: #4A4D58; --t-line: var(--ks-line);

    --mr-r: 14px; --mr-r-lg: 14px; --mr-r-md: 10px; --mr-r-sm: 8px; --mr-r-pill: 999px;
    --mr-tint: 100%;
    --mr-glass: var(--ks-s1); --mr-glass-strong: var(--ks-s2); --mr-glass-solid: var(--ks-s2);
    --mr-blur: 0px; --mr-glass-filter: none; --mr-glass-edge: var(--ks-edge);
    --mr-shadow-1: 0 1px 3px rgba(0,0,0,.4); --mr-shadow-2: 0 16px 40px -18px rgba(0,0,0,.8); --mr-shadow-3: 0 40px 90px -30px rgba(0,0,0,.9);
    --mr-font: var(--ks-text); --mr-font-display: var(--ks-display);
    --mr-grad: var(--ks-grad); --mr-grad-loop: linear-gradient(90deg, var(--ks-accent), var(--ks-accent-2), var(--ks-accent));
    --mr-grad-soft: linear-gradient(90deg, var(--ks-a10), transparent 90%);
    --mr-on-accent: var(--ks-on); --mr-ease: var(--ks-out); --mr-ease-spring: var(--ks-spring);
    --mr-t-1: 140ms; --mr-t-2: 240ms; --mr-t-3: 420ms; --mr-t-4: 700ms;
    --mr-spot-size: 0px; --mr-spot: none;
    --mr-ok: var(--ks-ok); --mr-warn: #FFC24A;
}`);

w('base.css', `/* KESTREL — base */
html, body { font-family: var(--ks-text) !important; color: var(--t-fg); -webkit-font-smoothing: antialiased; }
::selection { background: var(--ks-a40); color: #fff; }
:where(:focus-visible) { outline: 2px solid var(--ks-accent); outline-offset: 2px; border-radius: 8px; }
::-webkit-scrollbar { width: 10px; height: 10px; background: transparent; }
::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border: 3px solid transparent; border-radius: 99px; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,.22); }
::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
@keyframes mr-fade-up { from { opacity: 0; transform: translateY(calc(10px * var(--mr-motion))); } to { opacity: 1; transform: none; } }
@keyframes mr-pop { from { opacity: 0; transform: translateY(calc(4px * var(--mr-motion))) scale(calc(1 - .03 * var(--mr-motion))); } to { opacity: 1; transform: none; } }
@keyframes ks-in { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }`);

w('backdrop.css', `/* KESTREL — backdrop: flat ink */
html { background: var(--ks-ink) !important; }
body { background: transparent !important; }
.Wrapper.ForceOpaqueBackground, .FocusNavigationRoot, .Root, .OuterFrame, .ContentFrame { background: transparent !important; }`);

// ---------------------------------------------------------------------------------------------
w('layout.css', `/* KESTREL — layout. The Kestrel plugin owns the window's chrome; Steam's own pages fill the space below it. */
html .Library > .Container { padding: 0 16px 16px !important; gap: 14px !important; }
html .Library > .Container > .LibraryWindowDivider { opacity: 0; }
html .OuterFrame > .ContentFrame:not(:has(.Library)) { padding: 0 16px 16px !important; box-sizing: border-box !important; }`);

w('look.css', `/* ==========================================================================
   KESTREL — Steam's own pages inside the window: the classic game page,
   downloads, the library list when it is shown. Same ink, type and amber
   as Kestrel's views so moving between them feels like one application.
   ========================================================================== */
html .Library > .Container > div:not(.MainPanel):first-child, html .MainPanel { border-radius: 18px !important; background: var(--ks-s1) !important; box-shadow: var(--ks-edge) !important; }
html :is(.UpdatesContainer .Name, .ShowcaseHeader .Focusable, .ShowcaseHeader .DialogDropDown_CurrentDisplay) { font: 650 18px var(--ks-display) !important; letter-spacing: -.01em !important; text-transform: none !important; color: var(--ks-fg) !important; }
html :is(.AppDetailsSection .SectionHeader, h2.SectionHeader) { font: 650 15px var(--ks-display) !important; letter-spacing: 0 !important; text-transform: none !important; color: var(--ks-fg) !important; background: none !important; border: none !important; }
html .AppDetailsSection .SectionHeader::before { display: none !important; }
html .PlayBar .PlayBarLabel { font: 600 11px var(--ks-small) !important; letter-spacing: .06em !important; text-transform: uppercase !important; color: var(--ks-fg-3) !important; }
html .PlayBar :is(.LastPlayedInfo, .PlayBarDetailLabel) { font: 650 14px var(--ks-display) !important; color: var(--ks-fg) !important; }

/* game list */
html .HomeBox .Bar { border-radius: 12px !important; }
html .HomeBox .Bar.Selected { background: var(--ks-a10) !important; }
html .SearchInput input.DialogInput, html .SearchInput input.DialogTextInputBase { height: 36px !important; border-radius: 99px !important; background-color: var(--ks-s2) !important; border: none !important; box-shadow: var(--ks-edge) !important; }
html .ReactVirtualized__List .SectionName { font: 600 11px var(--ks-small) !important; letter-spacing: .06em !important; color: var(--ks-fg-3) !important; }
html .ReactVirtualized__List .Container:has(> .GameListEntryContainer) { border-radius: 10px !important; }
html .ReactVirtualized__List .Container:has(> .GameListEntryContainer):hover { background: var(--ks-s2) !important; }
html body .ReactVirtualized__List .Container.Selected.Selected:has(> .GameListEntryContainer) { background: var(--ks-a10) !important; box-shadow: none !important; }
html body .ReactVirtualized__List .Container.Selected:has(> .GameListEntryContainer) .GameListEntryContainer > span { color: var(--ks-accent-2) !important; }
html .ReactVirtualized__List .Container.Selected:has(> .GameListEntryContainer)::before { display: none !important; }

/* covers and cards */
html .LibraryItemBox, html .LibraryItemBox > *, html .UpdatesContainer .HoversEnabled { border-radius: 12px !important; }
html .LibraryItemBox::after { display: none !important; }
html .LibraryItemActionButton.Play { border-radius: 99px !important; background: var(--ks-grad) !important; box-shadow: 0 10px 24px -10px var(--ks-accent) !important; }
html .LibraryItemActionButton.Play svg :is(path, polygon) { fill: var(--ks-on) !important; }
html .EventTimeSpan, html .UpdatesContainer [class*="EventDate"] { background: var(--ks-ink) !important; color: var(--ks-fg) !important; border-radius: 8px 0 0 0 !important; }
html .UpdatesContainer .EventTime { color: var(--ks-accent-2) !important; }
html .DemoBanner { background: var(--ks-s3) !important; color: var(--ks-fg) !important; }
html .PageableContainer > .BoxCarousel { background: transparent !important; }
html .GameListHomeAndSearch { box-shadow: none !important; }

/* classic game page */
html .AppDetailsMain .PlayBar > .InnerContainer { border-radius: 18px !important; background: rgba(14,16,21,.86) !important; -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); box-shadow: var(--ks-edge) !important; }
html .PlayButton.ButtonChild { border-radius: 99px !important; background: var(--ks-grad) !important; color: var(--ks-on) !important; animation: none !important; box-shadow: 0 12px 28px -12px var(--ks-accent) !important; }
html .PlayButton.ButtonChild .ButtonText { font: 650 15px var(--ks-text) !important; text-transform: none !important; letter-spacing: 0 !important; color: var(--ks-on) !important; }
html .PlayButton.ButtonChild svg, html .PlayButton.ButtonChild svg path { fill: var(--ks-on) !important; }
html .PlayButtonContainer:has(.StreamingSelector) .PlayButton.ButtonChild { border-radius: 99px 6px 6px 99px !important; }
html .StreamingSelector.ButtonChild { margin-left: 3px !important; border-radius: 6px 99px 99px 6px !important; background: var(--ks-accent) !important; color: var(--ks-on) !important; }
html .StreamingSelector.ButtonChild svg :is(path, polygon) { fill: var(--ks-on) !important; }
html .PlayBar .RightControls .MenuButton { border-radius: 50% !important; background: var(--ks-s3) !important; box-shadow: none !important; }
html .PlayBar .RightControls .MenuButton:hover { background: var(--ks-s4) !important; transform: none !important; }
html .LinksSection .LinkInner { border-radius: 99px !important; background: var(--ks-s2) !important; box-shadow: var(--ks-edge) !important; color: var(--ks-fg-2) !important; font: 600 12.5px var(--ks-text) !important; text-transform: none !important; letter-spacing: 0 !important; }
html .LinksSection .LinkInner:hover { background: var(--ks-s3) !important; color: #fff !important; transform: none !important; }
html .AppDetailsSection:not(.LinksSection) > .Panel, html .PartnerEvent.Event { border-radius: 14px !important; background: var(--ks-s1) !important; box-shadow: var(--ks-edge) !important; }
html .PartnerEventLargeUpdate, html .PartnerEventLargeImage_Container { background: var(--ks-s1) !important; border-radius: 14px !important; }
html .PartnerEventFeaturedHeader { background: transparent !important; color: var(--ks-accent-2) !important; }
html .PartnerEventType, html .PartnerEventType * { color: var(--ks-accent-2) !important; }
html .ProgressBar .Unlocked, html .ProgressBar [class*="Unlocked"], html .PlayBar .DetailsProgressBar { background: var(--ks-grad) !important; border-radius: 99px !important; }
html .ProgressBar, html .PlayBar .DetailsProgressContainer { background: rgba(255,255,255,.08) !important; border-radius: 99px !important; }
html .CommunityItem.Blank, html .ReviewMetadata { background: var(--ks-s2) !important; border-radius: 12px !important; }
html .ReviewContainer { background: transparent !important; }
html .ReviewContainer .RatingContainer { border-radius: 14px !important; background: var(--ks-s1) !important; box-shadow: var(--ks-edge) !important; }
html .ReviewContainer .Playtime { color: var(--ks-accent-2) !important; }
html .ReviewContainer :is(.ReviewThumbButton, button) { border-radius: 99px !important; background: var(--ks-s3) !important; color: #fff !important; box-shadow: none !important; }
html .ReviewContainer :is(.ReviewThumbButton, button):hover { background: var(--ks-a20) !important; }
html .ScrollToTopButton > div { background: var(--ks-s3) !important; border-radius: 99px !important; }
html .URLBar { margin: 8px 0 !important; border-radius: 99px !important; background: var(--ks-s1) !important; box-shadow: var(--ks-edge) !important; border: none !important; }
html .URLBar .URLBarText { color: var(--ks-fg-3) !important; font-size: 12px !important; }

/* downloads */
html .DownloadsPage .Section { border-radius: 16px !important; }
html .BottomBar .DownloadStatus .DetailedDownloadProgress .ProgressBar { background: var(--ks-grad) !important; animation: none !important; }`);

w('look-controls.css', `/* KESTREL — controls in dialogs and native pages */
html .DialogButton { border-radius: 12px !important; background: var(--ks-s3) !important; box-shadow: none !important; color: var(--ks-fg) !important; font-weight: 600 !important; text-transform: none !important; letter-spacing: 0 !important; transition: background-color .2s, transform .3s var(--ks-spring) !important; }
html .DialogButton:not(.Disabled):not(:disabled):hover { background: var(--ks-s4) !important; transform: none !important; }
html .DialogButton:not(.Disabled):not(:disabled):active { transform: scale(.97) !important; }
html .DialogButton.Primary, html button.DialogButton.Primary { background: var(--ks-grad) !important; color: var(--ks-on) !important; box-shadow: 0 8px 22px -10px var(--ks-accent) !important; }
html :is(.DialogInput, .DialogTextInputBase), html .DialogDropDown { border-radius: 12px !important; background-color: var(--ks-s2) !important; border: none !important; box-shadow: var(--ks-edge) !important; }
html :is(.DialogInput, .DialogTextInputBase):focus { box-shadow: inset 0 0 0 1.5px var(--ks-accent) !important; }
html .Toggle .ToggleRail { border-radius: 99px !important; background: var(--ks-s4) !important; }
html .Toggle.On .ToggleRail, html .Toggle[class*="On"] .ToggleRail { background: var(--ks-accent) !important; }
html .Toggle .ToggleSwitch { background: #fff !important; transition: transform .36s var(--ks-spring), left .36s var(--ks-spring) !important; }
html .GenericConfirmDialog, html .ModalPosition_Content > .DialogContent { border-radius: 22px !important; background: var(--ks-s1) !important; box-shadow: inset 0 0 0 1px var(--ks-line-2), 0 40px 100px -24px #000 !important; animation: ks-in 360ms var(--ks-out) backwards; }
html .PagedSettingsDialog_PageListColumn .PagedSettingsDialog_Title { background: none !important; -webkit-text-fill-color: #fff; color: #fff !important; font: 700 24px var(--ks-display) !important; letter-spacing: -.02em !important; text-transform: none !important; }
html .PagedSettingsDialog .PagedSettingsDialog_PageListColumn { background: var(--ks-s1) !important; box-shadow: inset -1px 0 0 var(--ks-line); }
html .PagedSettingsDialog_PageList .PagedSettingsDialog_PageListItem { border-radius: 10px !important; transition: background-color .15s !important; }
html .PagedSettingsDialog_PageList .PagedSettingsDialog_PageListItem:hover { background: var(--ks-s2) !important; }
html .PagedSettingsDialog_PageList .PagedSettingsDialog_PageListItem.Active { background: var(--ks-a10) !important; color: var(--ks-accent-2) !important; box-shadow: inset 2px 0 0 var(--ks-accent) !important; }
html .PagedSettingsDialog_PageList .PagedSettingsDialog_PageListItem.Active::before { display: none !important; }
html .PagedSettingsDialog .SettingsDialogSubHeader { font: 650 14px var(--ks-display) !important; color: var(--ks-fg) !important; text-transform: none !important; letter-spacing: 0 !important; }
html .PagedSettingsDialog_PageContent, html .PagedSettingsDialog .DialogContent_InnerWidth { background: var(--ks-ink) !important; }`);

w('popup.css', `/* KESTREL menus: dark sheets with amber selection */
html .contextMenu .contextMenuContents, html .contextMenu .NotificationsMenu {
    border-radius: 16px !important; border: none !important; padding: 6px !important; background: var(--ks-s2) !important;
    box-shadow: inset 0 0 0 1px var(--ks-line-2) !important; animation: mr-pop 200ms var(--ks-out) backwards;
}
html .contextMenu .contextMenuContents .contextMenuItem { border-radius: 10px !important; padding: 8px 12px !important; background: transparent !important; color: var(--ks-fg) !important; font: 500 13px var(--ks-text) !important; text-transform: none !important; letter-spacing: 0 !important; transition: background-color .12s !important; }
html .contextMenu .contextMenuContents .contextMenuItem:not(.disabled):is(:hover,:focus,.active) { background: var(--ks-a20) !important; color: #fff !important; }
html .contextMenu .contextMenuContents .contextMenuItem.disabled { opacity: .4; }
html .contextMenu .contextMenuContents hr.Separator, html .contextMenu hr { border: none !important; height: 1px !important; margin: 5px 10px !important; background: var(--ks-line) !important; }
html .contextMenu .contextMenuContents .contextMenuItem.ContextMenuAction:is(.Play,.Launch) { background: var(--ks-grad) !important; color: var(--ks-on) !important; font-weight: 650 !important; }
html .contextMenu .contextMenuContents .contextMenuItem.ContextMenuAction svg :is(path,polygon,rect,circle) { fill: currentColor !important; }`);

w('toast.css', `/* KESTREL notifications: a dark card with an amber edge */
html .DesktopToastContainer .DesktopToastPopup { position: relative; border-radius: 18px !important; border: none !important; overflow: hidden; background: var(--ks-s2) !important;
    box-shadow: inset 0 0 0 1px var(--ks-line-2) !important; animation: ks-toast 560ms var(--ks-spring) backwards; }
html .DesktopToastContainer .DesktopToastPopup::before { content: ""; position: absolute; left: 0; top: 16px; bottom: 16px; width: 3px; border-radius: 0 3px 3px 0; background: var(--ks-grad); }
@keyframes ks-toast { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
html .DesktopToastContainer .DesktopToastTemplate :is(.Header .Title,.GroupMessageUserName,.IngameTitle) { font-family: var(--ks-display) !important; font-weight: 650 !important; color: #fff !important; }
html .DesktopToastContainer .DesktopToastTemplate :is(.StandardNotificationDescription,.GroupMessageBody,.StandardNotificationSubText) { color: var(--ks-fg-2) !important; }
html .DesktopToastContainer .DesktopToastTemplate :is(.AppLogo,.StandardLogoDimensions), html .DesktopToastContainer .DesktopToastTemplate .AppLogo :is(.Container,img) { border-radius: 10px !important; }
html .DesktopToastContainer .DesktopToastTemplate .FriendInGameAppColor { color: var(--ks-ok) !important; }`);

w('login.css', `/* KESTREL sign-in: the kestrel's wing and an orbiting amber light */
html .Login .SpinnerLoaderContainer::before { content: ""; position: absolute; left: 50%; top: 50%; width: 88px; height: 88px; margin: -44px 0 0 -44px; border-radius: 50%;
    background: conic-gradient(from 0deg, transparent 0 62%, var(--ks-accent), var(--ks-accent-2)); -webkit-mask: radial-gradient(circle, transparent 0 41px, #000 42px 44px); mask: radial-gradient(circle, transparent 0 41px, #000 42px 44px); animation: mr-spin 1.2s linear infinite; }
html .Login .SpinnerLoaderContainer::after { content: ""; position: absolute; left: 50%; top: 50%; width: 36px; height: 36px; margin: -18px 0 0 -18px;
    background: var(--ks-grad); -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M4 20.5C9 11 16.5 6 28 5.5c-5.8 3.1-9.2 7.4-10.6 13.2C13.8 16.4 9.4 17.3 4 20.5z'/></svg>") center / contain no-repeat; mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M4 20.5C9 11 16.5 6 28 5.5c-5.8 3.1-9.2 7.4-10.6 13.2C13.8 16.4 9.4 17.3 4 20.5z'/></svg>") center / contain no-repeat; }
html .Login .LoadingStatus, html .Login .LoadingStatus > .LoginStatus { font-family: var(--ks-text) !important; font-size: 13px !important; color: var(--ks-fg-2) !important; }
html .Login .ProgressBar { background: var(--ks-grad) !important; border-radius: 99px !important; }
html .Login .Avatar img { border-radius: 50% !important; box-shadow: 0 0 0 3px var(--ks-accent) !important; }
html .Login :is(.DialogButton, button[type="submit"]) { border-radius: 99px !important; }`);

w('friends.css', `/* ===== KESTREL friends and chat ===== */
html .currentUserContainer { border-radius: 18px !important; background: var(--ks-s2) !important; box-shadow: var(--ks-edge) !important; }
html .currentUserContainer .playerName { background: none !important; -webkit-text-fill-color: #fff; font-family: var(--ks-display) !important; font-weight: 650 !important; }
html .avatarHolder img.avatar, html .avatarHolder .avatar { border-radius: 50% !important; }
html .avatarHolder.online img.avatar { box-shadow: 0 0 0 2px var(--ks-s1), 0 0 0 4px var(--ks-cool) !important; }
html .avatarHolder.ingame img.avatar { box-shadow: 0 0 0 2px var(--ks-s1), 0 0 0 4px var(--ks-ok) !important; }
html .avatarHolder.awayOrSnooze img.avatar { box-shadow: 0 0 0 2px var(--ks-s1), 0 0 0 4px #FFC24A !important; }
html .friendTab, html .socialListTab, html .chatSectionTitle, html .friendsListSectionTitle { background: transparent !important; box-shadow: inset 0 -1px 0 var(--ks-line) !important; font-family: var(--ks-display) !important; font-weight: 650 !important; text-transform: none !important; letter-spacing: 0 !important; }
html .friendGroup .groupName { font: 600 11px var(--ks-small) !important; letter-spacing: .06em !important; text-transform: uppercase !important; color: var(--ks-fg-3) !important; }
html .friend { border-radius: 12px !important; }
html .friend:hover { background: var(--ks-s2) !important; }
html .friend.ingame .playerName, html .friend.ingame .gameName { color: var(--ks-ok) !important; }
html .chatEntry .chatEntryControls, html .chatentry_chatTextarea_113iu, html textarea.chatTextarea { border-radius: 14px !important; }
html .ChatMessageBlock .speaker .speakerName { color: var(--ks-accent-2) !important; }`);

// ---------------------------------------------------------------------------------------------
w('web.css', `/* ===== KESTREL web layer: Store and Community in Kestrel's language =====
   Steam's page layouts stay; the colour, type, shapes and buttons become Kestrel's. */
:root { --ks-page: #08090C; }
html, body, body.v6, body.v7, .responsive_page_frame, .responsive_page_content, .page_content_ctn, .home_page_body_ctn, .game_page_background, .store_page_bg, .apphub_background, .pagecontent, .profile_page { background-color: var(--ks-page) !important; }
body, body.v6 { font-family: "Segoe UI Variable Text", "Segoe UI", sans-serif !important; }
h1, h2, .pageheader, .home_page_content h2, .home_section_title, .apphub_AppName, #appHubAppName, .home_page_content .home_page_sign_in_ctn h2 { font-family: "Segoe UI Variable Display", "Segoe UI", sans-serif !important; font-weight: 650 !important; text-transform: none !important; letter-spacing: -.01em !important; color: #F2EFE8 !important; }

/* store navigation bar: a dark pill instead of Valve's blue strip */
#store_nav_area .store_nav_bg, .store_nav_bg { background: #0E1015 !important; border-radius: 99px !important; box-shadow: inset 0 0 0 1px rgba(236,232,222,.08) !important; }
#store_nav_area .store_nav .tab, .store_nav .tab > span { color: #C9C6BE !important; font-family: "Segoe UI Variable Text", "Segoe UI", sans-serif !important; font-weight: 600 !important; text-transform: none !important; }
#store_nav_area .store_nav .tab:hover, .store_nav .tab.focus { background: rgba(240,162,59,.14) !important; border-radius: 99px; }
#store_search { background: #141720 !important; border-radius: 99px !important; border: none !important; box-shadow: inset 0 0 0 1px rgba(236,232,222,.08) !important; }
#store_search_link img, #store_search .searchbox button { filter: none !important; }
#store_search_link, #store_search .searchbox button, button[class*="SearchButton"] { background: linear-gradient(180deg, #FFCB7A, #F0A23B) !important; border-radius: 99px !important; }

/* capsules and rows */
.store_main_capsule, .store_capsule, .tab_item, .search_result_row, .apphub_Card, .game_area_purchase_game, .home_area_spotlight, .special_tiny_cap, .store_capsule img, img.tab_item_cap_img, .wishlist_row { border-radius: 14px !important; }
.store_capsule, .store_main_capsule, .home_area_spotlight { overflow: hidden; }
.tab_item, .search_result_row, .game_area_purchase_game, .home_area_spotlight, .wishlist_row { background: #0E1015 !important; box-shadow: inset 0 0 0 1px rgba(236,232,222,.07) !important; border: none !important; transition: background-color .2s, transform .35s cubic-bezier(.34,1.36,.5,1) !important; }
.tab_item:hover, .search_result_row:hover, .wishlist_row:hover { background: #141720 !important; }
.store_capsule:hover, .tab_item:hover, .search_result_row:hover { transform: translateY(-2px); }
.home_tabs_row .tab, .home_tabs_row .tab.active { border-radius: 99px 99px 0 0 !important; }
.home_tabs_row .tab.active, .home_tabs_row .tab.active .tab_content { background: #141720 !important; color: #FFCB7A !important; }
.app_tag { border-radius: 99px !important; background: rgba(255,255,255,.07) !important; color: #C9C6BE !important; box-shadow: none !important; }
.app_tag:hover { background: rgba(240,162,59,.18) !important; color: #fff !important; }

/* prices and buttons */
.discount_pct, .bundle_base_discount { background: linear-gradient(180deg, #FFCB7A, #F0A23B) !important; color: #1A1004 !important; border-radius: 99px !important; font-weight: 700 !important; }
.discount_block .discount_prices, .discount_prices { background: rgba(255,255,255,.06) !important; border-radius: 0 99px 99px 0 !important; }
.discount_final_price, .game_purchase_price { color: #FFCB7A !important; }
.discount_original_price { color: #6F727D !important; }
.btn_green_steamui, .btn_green_white_innerfade, .btnv6_green_white_innerfade, .btn_addtocart > a { background: linear-gradient(180deg, #FFCB7A, #F0A23B) !important; border-radius: 99px !important; box-shadow: 0 10px 26px -12px #F0A23B !important; border: none !important; }
.btn_green_steamui > span, .btn_green_white_innerfade > span, .btnv6_green_white_innerfade > span { background: transparent !important; color: #1A1004 !important; font-weight: 650 !important; text-shadow: none !important; }
.btn_blue_steamui, .btnv6_blue_hoverfade, .btnv6_blue_blue_innerfade, .btn_darkblue_white_innerfade, .btnv6_lightblue_blue { background: #1C202B !important; border-radius: 99px !important; color: #F2EFE8 !important; border: none !important; }
.btn_blue_steamui > span, .btnv6_blue_hoverfade > span, .btnv6_blue_blue_innerfade > span, .btn_darkblue_white_innerfade > span, .btnv6_lightblue_blue > span { background: transparent !important; color: #F2EFE8 !important; }
.btn_blue_steamui:hover, .btnv6_blue_hoverfade:hover, .btnv6_blue_blue_innerfade:hover, .btn_darkblue_white_innerfade:hover { background: #262B38 !important; }
a:not([class]) { color: #FFCB7A; }
.btnv6_white_transparent, .btn_white_transparent, .home_section_btn, .btn_medium_tall.btnv6_white_transparent { background: #1C202B !important; border-radius: 99px !important; border: none !important; }
.btnv6_white_transparent > span, .btn_white_transparent > span { background: transparent !important; color: #F2EFE8 !important; }
.btnv6_white_transparent:hover, .btn_white_transparent:hover { background: #262B38 !important; }

/* leftover Valve blues on the store front */
#wishlist_tier, #dlc_tier, .home_discounts_ctn .four_pack_block > div { background: #0E1015 !important; border-radius: 16px !important; box-shadow: inset 0 0 0 1px rgba(236,232,222,.07) !important; }
.tab_preview, .tab_preview.focus, .tab_row_item.focus, .home_tab_content .tab_item.focus { background: #141720 !important; }
[class*="WidgetHeaderCtn"], :has(> [class*="WidgetHeaderCtn"]) { background: linear-gradient(77deg, #1C202B 0%, #141720 60%, rgba(240,162,59,.18) 100%) !important; border-radius: 16px; }
.capsule_row_ctn > div, .deep_dive_key_tags { background: #141720 !important; }
.home_tab_button.active { border-bottom-color: #F0A23B !important; }
.home_tab_button.active .tab_content { color: #FFCB7A !important; }
:has(> [class*="WidgetHeaderCtn"]) > div:not([class*="WidgetHeaderCtn"]) { background: #141720 !important; }
.carousel_items .gradient { background: linear-gradient(155deg, transparent 15%, rgba(240,162,59,.32)) !important; }
.ds_flag.ds_owned_flag, .ds_flag.ds_wishlist_flag, .ds_flag { background: linear-gradient(180deg, #FFCB7A, #F0A23B) !important; color: #1A1004 !important; border-radius: 99px 0 0 99px !important; }

/* community */
.apphub_HomeHeaderContent, .apphub_HeaderTop, .profile_header_bg, .profile_header_bg_texture { background: transparent !important; }
.profile_content, .profile_leftcol, .profile_rightcol .profile_count_link_preview, .showcase_content_bg, .profile_customization { background: #0E1015 !important; border-radius: 16px !important; }
.apphub_CardContentMain, .apphub_CardContentAuthorBlock { background: #0E1015 !important; }
.commentthread_area, .commentthread_comment { background: #0E1015 !important; border-radius: 12px !important; }
.playerAvatar, .playerAvatar img, .profile_avatar_frame img { border-radius: 50% !important; }
.apphub_background .left > div, .apphub_background .right > div, .community_home_search, .apphub_HomeSearchCtn { background: #141720 !important; border-radius: 12px !important; box-shadow: none !important; }
.apphub_background input[type="text"], .community_home_search input, input.apphub_SearchInput, .searchbox input { background: #141720 !important; border: none !important; border-radius: 99px !important; box-shadow: inset 0 0 0 1px rgba(236,232,222,.1) !important; color: #F2EFE8 !important; }
.apphub_sectionTab, .apphub_sectionTabs a, .inner_bevel, .btn_small.btn_uppercase { background: #1C202B !important; border: none !important; border-radius: 99px !important; color: #C9C6BE !important; text-transform: none !important; letter-spacing: 0 !important; }
.apphub_sectionTab.active, .apphub_sectionTabs a.active, .apphub_sectionTab:hover { background: rgba(240,162,59,.18) !important; color: #FFCB7A !important; }
.community_home_recent_game a, .community_home_recent_game_stats, .community_home_recent_hub a span, .apphub_background a > span { color: #E9C48A !important; }`);

// ---------------------------------------------------------------------------------------------
w('theme.js', `/* KESTREL skin — no readout, no startup screen, no tilt: the plugin draws the interface. */
const THEME = { name: "KestrelSkin", tilt: 0, hud: null, boot: null };`);

w('meta.json', JSON.stringify({
	folder: 'Kestrel', name: 'Kestrel',
	description: "Companion skin for the Kestrel plugin. Dresses Steam's own pages, dialogs, menus, notifications, friends and chat, sign-in, and the Store and Community in Kestrel's ink and amber.",
	tags: ['Kestrel', 'Companion', 'Dark'],
	hudLabel: 'Not used by Kestrel.',
	bootLabel: 'Not used by Kestrel.',
	conditions: {},
	drop: ['Layout', 'Navigator', 'Dock labels', 'Readout', 'Startup screen', 'Cover hover', 'Cursor light', "What's New shelf", 'Game list density', 'Privacy'],
}, null, 2));
console.log('kestrel skin spec ok');
