import {
	App,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import * as ReactDom from "react-dom/client";
import * as React from "react";
import Toolbar from "./Toolbar";
import { AppContext } from "./context";

// Remember to rename these classes and interfaces!

interface TravelReviewPluginSettings {
	foldersIncluding: string;
}

const DEFAULT_SETTINGS: TravelReviewPluginSettings = {
	foldersIncluding: "*",
};

export default class TravelReviewPlugin extends Plugin {
	settings: TravelReviewPluginSettings;
	notePathsToTravel: any[] = [];
	totalNotesToTravel: Number = 0;
	isToolBarShown = true;
	startedNotePath: String;

	openFileToCurrentActiveLeaf(path: String) {
		const activeLeaf = this.app.workspace.activeLeaf;
		const toOpenFile = this.app.vault
			.getMarkdownFiles()
			.filter((file) => {
				return file.path === path;
			})
			.first();
		if (toOpenFile) {
			activeLeaf.openFile(toOpenFile);
		}
	}
	resetTravel() {
		const traveledArray = [];

		const currentActiveFile = this.app.workspace.getActiveFile();
		traveledArray.push(currentActiveFile.path);
		const resolvedLinksObjects = this.app.metadataCache.resolvedLinks;

		new Notice(`Start travel with ${currentActiveFile.path}`);

		let idx = 0;
		while (idx < traveledArray.length) {
			const resolvedLinksObject =
				resolvedLinksObjects[traveledArray[idx]];
			const resolvedLinks =
				Object.getOwnPropertyNames(resolvedLinksObject);
			for (const link of resolvedLinks) {
				if (traveledArray.includes(link)) {
					continue;
				}
				traveledArray.push(link);
			}
			idx++;
		}
		this.startedNotePath = traveledArray.shift();
		this.totalNotesToTravel = traveledArray.length;
		this.notePathsToTravel = traveledArray;
	}
	travelToNext() {
		// console.log(this);
		if (this.notePathsToTravel.length === 0) {
			new Notice("Travel is Done!");
			return;
		}
		const nextPath = this.notePathsToTravel.shift();
		this.openFileToCurrentActiveLeaf(nextPath);
	}
	getTotalNotesToTravel() {
		return this.totalNotesToTravel;
	}
	getRemainNotesToTravel() {
		return this.notePathsToTravel.length;
	}
	getStartedNotePath() {
		return this.startedNotePath;
	}

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"bike",
			"Travel Review",
			(e: MouseEvent) => {
				// Called when the user clicks the icon.
				// new Notice("This is a notice!");
				// this.openFileToCurrentActiveLeaf("React.md");
				// this.travelToNext();
				const container: HTMLElement | null = document.querySelector(
					".obsidian-travel-review-plugin"
				);
				if (!container) {
					const activeMarkdownView =
						this.app.workspace.getActiveViewOfType(MarkdownView);
					if (!activeMarkdownView) {
						new Notice("Only work on markdown file!")
						return;
					}
					const floatToolbar = document.createElement("div");
					floatToolbar.addClass("obsidian-travel-review-plugin");
					activeMarkdownView.contentEl.appendChild(floatToolbar);
					ReactDom.createRoot(floatToolbar).render(
						<AppContext.Provider
							value={{
								obsidianApp: this.app,
								travelToNext: this.travelToNext.bind(this),
								resetTravel: this.resetTravel.bind(this),
								getTotalNotesToTravel:
									this.getTotalNotesToTravel.bind(this),
								getRemainNotesToTravel:
									this.getRemainNotesToTravel.bind(this),
								getStartedNotePath:
									this.getStartedNotePath.bind(this),
							}}
						>
							<Toolbar />
						</AppContext.Provider>
					);
					this.isToolBarShown = true;
					floatToolbar.hidden = !this.isToolBarShown;
					return;
				}
				this.isToolBarShown = !this.isToolBarShown;
				container.hidden = !this.isToolBarShown;
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: "travel-view-reset",
		// 	name: "Reset travel with current active file",
		// 	callback: () => {
		// 		// new SampleModal(this.app).open();
		// 		this.resetTravel();
		// 	},
		// });

		// this.addCommand({
		// 	id: "travel-view-next",
		// 	name: "Travel to next note",
		// 	callback: () => {
		// 		this.travelToNext();
		// 	},
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TravelReviewSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// console.log(this.app);
		// console.log(this.app.metadataCache.resolvedLinks);
		// console.log('click', evt);
		// });
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TravelReviewSettingTab extends PluginSettingTab {
	plugin: TravelReviewPlugin;

	constructor(app: App, plugin: TravelReviewPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Travel Review Plugin Settting" });

		new Setting(containerEl)
			.setName("Folders Including")
			.setDesc("folders to be included seperated by ;")
			.addText((text) =>
				text
					.setPlaceholder("In developing, invalid now...")
					.setValue(this.plugin.settings.foldersIncluding)
					.onChange(async (value) => {
						this.plugin.settings.foldersIncluding = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
