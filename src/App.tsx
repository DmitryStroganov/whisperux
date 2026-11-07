import React from 'react';
import { TranscriptionResult, QueueItem, HealthStatus, Language } from './types';
import { transcribeAudio, checkHealth } from './services/whisperApi';
import UploadArea from './components/UploadArea';
import HealthIndicator from './components/HealthIndicator';
import LanguageSelector from './components/LanguageSelector';
import FileQueue from './components/FileQueue';
import HistoryTable from './components/HistoryTable';
import './index.css';
import './styles/variables.less';
import './styles/base.less';
import './styles/utils.less';
import './styles/app.less';
import './styles/components.less';

interface AppState {
  queue: QueueItem[];
  results: TranscriptionResult[];
  health: HealthStatus;
  language: Language;
  processing: boolean;
}

export default class App extends React.Component<{}, AppState> {
  state: AppState = {
    queue: [],
    results: [],
    health: { isHealthy: false, lastChecked: new Date() },
    language: 'en',
    processing: false,
  };

  healthInterval: number | null = null;
  retryCount: number = 0;
  private mounted = true;
  private healthCheckInFlight = false;

  componentDidMount() {
    this.mounted = true;
    this.checkHealthStatus();
    // Health check interval - configurable via environment variable or default to 20000ms
    const envInterval = import.meta.env?.HEALTH_CHECK_INTERVAL;
    const healthCheckInterval = Number.isFinite(parseInt(envInterval || '', 10)) && parseInt(envInterval || '', 10) > 0 ? parseInt(envInterval || '', 10) : 20000;
    this.healthInterval = window.setInterval(() => {
      this.checkHealthStatus();
    }, healthCheckInterval);
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.healthInterval !== null) {
      window.clearInterval(this.healthInterval);
    }
  }

  checkHealthStatus = async () => {
    const maxRetries = 1;
    const retryDelayMs = (() => {
      const envRetryDelay = import.meta.env?.HEALTH_CHECK_RETRY_DELAY;
      if (!envRetryDelay) return 5000;
      const parsed = parseInt(envRetryDelay, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 5000;
    })();

    if (this.healthCheckInFlight) return;
    this.healthCheckInFlight = true;

    try {
      let isHealthy = false;

      try {
        isHealthy = await checkHealth();
      } catch (error) {
        console.error('[Health Check] Error in health check:', error);
        isHealthy = false;
      }

      // Update state with health status
      this.setState({
        health: { isHealthy, lastChecked: new Date() },
      });

      // If backend was previously unhealthy and now appears healthy, log it
      if (!this.state.health.isHealthy && isHealthy) {
        console.log('[Health Check] Backend is back online!');
      }

      // If backend is unhealthy, schedule a retry to verify backend status
      if (!isHealthy && this.retryCount < maxRetries) {
        console.log(`[Health Check] Backend unhealthy, verifying in ${retryDelayMs}ms...`);
        setTimeout(() => {
          if (!this.mounted) return;
          this.retryCount++;
          this.checkHealthStatus();
        }, retryDelayMs);
      } else if (isHealthy) {
        // Reset retry count when backend recovers
        this.retryCount = 0;
      }
    } finally {
      this.healthCheckInFlight = false;
    }
  };

  handleFilesSelected = (files: FileList) => {
    console.log('[App] Files selected:', files.length);
    for (const file of Array.from(files)) {
      console.log('[App] File:', file.name, 'type:', file.type, 'size:', file.size);
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    const newItems: QueueItem[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      const isAudio = file.type.startsWith('audio/') || file.type === 'video/mp4';
      const hasValidExtension = /\.(webm|wav|mp4|mp3|ogg|m4a|flac)$/i.test(file.name);
      if (!isAudio && !hasValidExtension) {
        errors.push(`${file.name}: unsupported format`);
        console.log('[App] Skipping file (unsupported):', file.name);
        continue;
      }
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: exceeds 25 MB limit`);
        console.log('[App] Skipping file (too large):', file.name);
        continue;
      }
      newItems.push({ file, status: 'waiting', progress: 0 });
    }

    console.log('[App] Valid files to process:', newItems.length);

    if (newItems.length > 0) {
      const updatedQueue = [...this.state.queue, ...newItems];
      console.log('[App] Starting queue processing');
      console.log('[App] Updated queue length:', updatedQueue.length);
      this.setState({ queue: updatedQueue });
      this.processQueue(updatedQueue);
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
  };

  processQueue = async (queue: QueueItem[] = this.state.queue) => {
    console.log('[App] processQueue called, items in queue:', queue.length);
    console.log('[App] Current state:', { processing: this.state.processing });
    
    if (this.state.processing) {
      console.log('[App] Already processing, skipping');
      return;
    }

    const items = [...queue];
    console.log('[App] Items to process:', items.map(i => i.file.name));

    this.setState({ processing: true });

    for (const item of items) {

      this.setState((prevState) => ({
        queue: prevState.queue.map((q) =>
          q === item ? { ...q, status: 'processing' as const, progress: 0 } : q
        ),
      }));


      let progress = 0;
      let itemInterval: number | undefined;

      const updateProgress = () => {
        progress = Math.min(progress + 10, 100);
        this.setState((prevState) => ({
          queue: prevState.queue.map((q) =>
            q === item ? { ...q, progress } : q
          ),
        }));
      };

      itemInterval = window.setInterval(updateProgress, 500);

      try {
        const text = await transcribeAudio(item.file, this.state.language, 'whisper-1');


        if (itemInterval !== undefined) {
          window.clearInterval(itemInterval);
          itemInterval = undefined;
        }


        const result: TranscriptionResult = {
          filename: item.file.name,
          text,
          language: this.state.language,
          duration: item.file.size,
          timestamp: new Date(),
        };


        this.setState((prevState) => ({
          queue: prevState.queue.filter((q) => q.file.name !== item.file.name),
          results: [result, ...prevState.results],
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        

        if (itemInterval !== undefined) {
          window.clearInterval(itemInterval);
          itemInterval = undefined;
        }

        this.setState((prevState) => ({
          queue: prevState.queue.map((q) =>
            q === item ? { ...q, status: 'error' as const, error: errorMessage } : q
          ),
        }));


        setTimeout(() => {
          this.setState((prevState) => ({
            queue: prevState.queue.filter((q) => q !== item),
          }));
        }, 3000);
        throw error;
      }
    }

    this.setState({ processing: false });
  };

  handleLanguageChange = (lang: Language) => {
    this.setState({ language: lang });
  };

  handleClearHistory = () => {
    this.setState({ results: [] });
  };

  render() {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Whisper Audio Transcriber</h1>
          <HealthIndicator status={this.state.health} />
        </header>

        <main className="app-main">
          <div className="controls">
            <LanguageSelector
              selected={this.state.language}
              onChange={this.handleLanguageChange}
            />
          </div>

          <UploadArea onFilesSelected={this.handleFilesSelected} />

          <FileQueue items={this.state.queue} />

          <HistoryTable
            results={this.state.results}
            onClear={this.handleClearHistory}
          />
        </main>
      </div>
    );
  }
}