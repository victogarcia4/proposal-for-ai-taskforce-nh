import { useEffect, useRef } from 'react';
import { initializeDashboard } from '../lib/dashboard-controller.mjs';

// Compatibility boundary: React owns the static shell; the preserved controller
// owns only its empty dynamic containers and browser-side interactions.
export function Dashboard() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return initializeDashboard(root.current);
  }, []);
  return <div ref={root}>
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="North Harris AI Task Force home">
          <img className="lsc-logo" src="/LSC-North%20Harris%20logo.png" alt="Lone Star College-North Harris" />
          <span className="brand-copy">
            <strong>AI Task Force</strong>
            <small>Lone Star College-North Harris</small>
          </span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <button className="nav-link is-active" data-view-target="overview">Overview</button>
          <button className="nav-link" data-view-target="primer">PRIMER</button>
          <button className="nav-link" data-view-target="tables">Working tables</button>
          <button className="nav-link" data-view-target="actions">Action board</button>
          <button className="nav-link" data-view-target="artifacts">Artifacts</button>
        </nav>
        <div className="top-actions">
          <span className="sync-status" id="syncStatus" data-status="local">
            <span className="status-dot"></span>
            <span id="syncLabel">Local draft</span>
          </span>
          <button className="icon-button" id="themeToggle" type="button" aria-label="Switch to night mode" title="Switch to night mode">☾</button>
          <button className="button button-dark button-small" id="printButton" type="button">Print / PDF</button>
        </div>
      </header>

      <main id="app" tabIndex={-1}>
        <section className="hero section-anchor" id="overview" aria-labelledby="heroTitle">
          <div className="hero-copy">
            <p className="eyebrow">North Harris / System conversation</p>
            <h1 id="heroTitle">Turn the working session into a proposal people can act on.</h1>
            <p className="hero-lede">A shared workspace for faculty and staff to map responsible AI use across curriculum, workplace practice, and follow-up.</p>
            <div className="hero-meta">
              <span className="source-chip">Source: September 22, 2026 working session</span>
              <a className="text-link" href="https://docs.google.com/document/d/1xaFlGBjhbadQ4ZgiYu1czJKfbqJc7HUwxGldPY89vWA/edit?usp=sharing" target="_blank" rel="noreferrer">Open source document ↗</a>
            </div>
          </div>
          <div className="hero-rail" aria-label="Session status">
            <div className="rail-label">Working session status</div>
            <div className="rail-number" id="heroContributionCount">00</div>
            <div className="rail-copy">contributions saved across the three tables</div>
            <div className="rail-divider"></div>
            <div className="rail-detail"><span>Shared vocabulary</span><strong>PRIMER</strong></div>
            <div className="rail-detail"><span>System audience</span><strong>LSC colleges</strong></div>
          </div>
        </section>

        <section className="snapshot section-block" aria-labelledby="snapshotTitle">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">At a glance</p>
              <h2 id="snapshotTitle">One conversation, four working surfaces.</h2>
            </div>
            <p className="section-note">Use this dashboard during the session, then carry the saved record into a one-page proposal.</p>
          </div>
          <div className="metric-grid" id="metricGrid"></div>
        </section>

        <section className="section-block table-overview" aria-labelledby="tableOverviewTitle">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Breakout map</p>
              <h2 id="tableOverviewTitle">Three tables with a shared language.</h2>
            </div>
            <button className="button button-outline" data-view-target="tables">Open working tables</button>
          </div>
          <div className="table-card-grid" id="tableCardGrid"></div>
        </section>

        <section className="primer-section section-block section-anchor" id="primer" aria-labelledby="primerTitle">
          <div className="section-heading primer-heading">
            <div>
              <p className="eyebrow">Presentation mode</p>
              <h2 id="primerTitle">PRIMER is the shared vocabulary.</h2>
            </div>
            <div className="heading-actions">
              <button className="button button-light" id="presentPrimerButton" type="button">Present PRIMER</button>
              <button className="button button-outline" id="primerPrintButton" type="button">Print PRIMER</button>
            </div>
          </div>
          <div className="primer-stage" id="primerStage">
            <div className="primer-stage-topline">
              <span id="primerSlideLabel">01 / 09</span>
              <span>Process over polish</span>
            </div>
            <div className="primer-slide" id="primerSlide" aria-live="polite"></div>
            <div className="primer-controls">
              <button className="round-button" id="primerPrev" type="button" aria-label="Previous PRIMER slide">←</button>
              <div className="slide-progress" aria-hidden="true"><span id="primerProgress"></span></div>
              <button className="round-button" id="primerNext" type="button" aria-label="Next PRIMER slide">→</button>
            </div>
          </div>
          <div className="primer-print-only" id="primerPrintOnly"></div>
        </section>

        <section className="section-block section-anchor" id="tables" aria-labelledby="tablesTitle">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Collaborative workspace</p>
              <h2 id="tablesTitle">Capture the conversation while it is happening.</h2>
            </div>
            <div className="contributor-field">
              <label htmlFor="contributorName">Your name</label>
              <input id="contributorName" type="text" placeholder="e.g. Victor Garcia" autoComplete="name" />
            </div>
          </div>
          <div className="table-tabs" id="tableTabs" role="tablist" aria-label="Working tables"></div>
          <div className="working-table-layout">
            <aside className="table-context" id="tableContext"></aside>
            <div className="table-workspace">
              <div className="prompt-list" id="promptList"></div>
              <form className="contribution-form" id="contributionForm">
                <div className="form-header">
                  <div>
                    <p className="eyebrow">Add a contribution</p>
                    <h3>Make the proposal more specific.</h3>
                  </div>
                  <span className="form-hint">Saved for the whole group</span>
                </div>
                <input type="hidden" id="contributionTableKey" />
                <label>
                  Contribution
                  <textarea id="contributionText" rows={3} required placeholder="What did the group say, notice, or propose?"></textarea>
                </label>
                <div className="form-grid">
                  <label>Theme or prompt
                    <select id="contributionPrompt"></select>
                  </label>
                  <label>Discipline or role
                    <input id="contributionRole" type="text" placeholder="e.g. Health / Nursing" />
                  </label>
                  <label>Signal
                    <select id="contributionSignal">
                      <option value="opportunity">Opportunity</option>
                      <option value="risk">Risk / concern</option>
                      <option value="decision">Decision</option>
                      <option value="question">Open question</option>
                    </select>
                  </label>
                </div>
                <div className="form-actions">
                  <span className="form-status" id="contributionStatus" role="status"></span>
                  <button className="button button-accent" type="submit">Save contribution</button>
                </div>
              </form>
              <div className="saved-heading">
                <div>
                  <p className="eyebrow">Saved contributions</p>
                  <h3 id="savedContributionTitle">Table 1 notes</h3>
                </div>
                <span className="count-badge" id="savedContributionCount">0</span>
              </div>
              <div className="contribution-list" id="contributionList"></div>
            </div>
          </div>
        </section>

        <section className="section-block section-anchor action-section" id="actions" aria-labelledby="actionsTitle">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Closing &amp; next steps</p>
              <h2 id="actionsTitle">Keep the proposal moving after the room clears.</h2>
            </div>
            <button className="button button-outline" id="addActionButton" type="button">Add action</button>
          </div>
          <div className="action-board" id="actionBoard"></div>
          <form className="action-form hidden" id="actionForm">
            <div className="form-grid action-form-grid">
              <label>Action item<input id="actionText" required type="text" placeholder="What needs to happen next?" /></label>
              <label>Owner<input id="actionOwner" type="text" placeholder="Assign a person or team" /></label>
              <label>Target date<input id="actionDate" type="text" placeholder="e.g. October 15" /></label>
            </div>
            <div className="form-actions"><span className="form-status" id="actionStatus" role="status"></span><button className="button button-accent" type="submit">Save action</button></div>
          </form>
        </section>

        <section className="section-block section-anchor artifacts-section" id="artifacts" aria-labelledby="artifactsTitle">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Shared artifacts</p>
              <h2 id="artifactsTitle">Keep the evidence with the conversation.</h2>
            </div>
            <span className="section-note">Text files, Word-compatible notes, Markdown, and source links can travel with the dashboard.</span>
          </div>
          <div className="artifact-grid">
            <form className="artifact-composer" id="artifactForm">
              <div className="form-header"><div><p className="eyebrow">Create a text artifact</p><h3>Save a clean handoff.</h3></div></div>
              <label>File name<input id="artifactName" required type="text" defaultValue="north-harris-ai-task-force-notes.md" /></label>
              <label>Format<select id="artifactFormat"><option value="md">Markdown (.md)</option><option value="txt">Plain text (.txt)</option><option value="doc">Word-compatible document (.doc)</option></select></label>
              <label>Content<textarea id="artifactContent" rows={8} placeholder="Write or paste a handoff, a table summary, or a draft proposal."></textarea></label>
              <div className="form-actions"><span className="form-status" id="artifactStatus" role="status"></span><button className="button button-accent" type="submit">Save artifact</button></div>
            </form>
            <div className="artifact-composer upload-composer">
              <div className="form-header"><div><p className="eyebrow">Upload a file</p><h3>Bring the source along.</h3></div></div>
              <label className="file-drop" htmlFor="fileInput"><input id="fileInput" type="file" /><span className="file-drop-icon">+</span><strong>Choose any file</strong><small>Text, Markdown, Word, or other supporting files</small></label>
              <p className="upload-note">Files are stored in the deployed Netlify version through its shared blob store. Local previews use this browser until the site is deployed.</p>
              <label>Google Doc or source link<input id="resourceUrl" type="url" placeholder="https://docs.google.com/..." /></label>
              <label>Label<input id="resourceLabel" type="text" placeholder="e.g. Working session source" /></label>
              <button className="button button-outline full-width" id="addResourceButton" type="button">Save source link</button>
            </div>
          </div>
          <div className="artifact-list" id="artifactList"></div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-branding">
          <img className="footer-logo" src="/LSC-North%20Harris%20logo.png" alt="Lone Star College-North Harris" />
          <span>North Harris AI Task Force workspace</span>
        </div>
        <div className="creator-credit">
          <img className="creator-avatar" src="/VHGM%20traje%20azul.png" alt="Dr. Victor Garcia Martinez" />
          <div className="creator-copy">
            <span className="creator-label">Built by</span>
            <strong>Dr. Victor Garcia Martinez</strong>
            <span>@ Lone Star College</span>
          </div>
        </div>
        <span className="footer-note">Built for shared thinking, clear ownership, and responsible AI use.</span>
      </footer>
    </div>
    <div className="toast" id="toast" role="status" aria-live="polite"></div>
    
  <noscript>This working-session dashboard needs JavaScript to save contributions.</noscript>
  </div>;
}
