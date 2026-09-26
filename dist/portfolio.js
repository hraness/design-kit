import"./chunk-5gtx3pza.js";

// src/portfolio.generated.ts
var portfolioSnapshot = {
  contract: "hraness.design-kit-portfolio/v1",
  formatVersion: 1,
  provenance: {
    registry: "https://hraness.com/portfolio.json",
    commit: "cd7ad529c7f821b224300277186f4c533655a8a1",
    committedOn: "2026-09-26",
    upstreamContract: "hraness.portfolio-public/v1",
    upstreamDigest: "sha256:e678776157418c6242953e52b77513de61878f3bba7a08c1e7dea385f511f18e",
    files: [{
      path: "portfolio.public.generated.json",
      sha256: "337208b5668145366d9a9536fec71d1dff73decf7eeb8f1a9dc183b2765ad17e"
    }, {
      path: "packages/brand-catalog/brands.yaml",
      sha256: "8513c6c94db1dc4d6aed90c0faf913f4333c59893140e801d23beda671d5e7ce"
    }]
  },
  products: {
    gobstopper: {
      id: "gobstopper",
      name: "Gobstopper",
      oneLiner: "Compacts long agent sessions into smaller copies, keeping every byte",
      brandDescription: "Gobstopper makes long Claude Code and Codex sessions smaller. Preview each cut, write a compacted copy, and keep every original byte in a local vault.",
      canonicalUrl: "https://gobstopper.sh",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "gobstopper",
        names: {
          name: "Gobstopper",
          catalog: "GOBSTOPPER",
          command: "gobstopper"
        },
        category: "Session compaction tool",
        tagline: "Context compaction you can undo.",
        short: "Compacts long agent sessions into smaller copies, keeping every byte",
        meta: "Gobstopper makes long Claude Code and Codex sessions smaller. Preview each cut, write a compacted copy, and keep every original byte in a local vault.",
        medium: "Gobstopper is a free, open-source command-line tool that makes long Claude Code and Codex sessions smaller. Preview a compaction, write a smaller copy, and keep the original byte for byte in a local vault.",
        long: "Long coding-agent sessions collect tool output that mattered once: test logs from runs that have since passed, file listings from before a refactor, stack traces for bugs already fixed. Every turn sends all of it to the model again. Gobstopper is a free, open-source command-line tool that finds your Claude Code and Codex sessions, shows what each compaction strategy would cut, and writes a smaller copy. Before it writes, it stores the original bytes in a content-addressed vault on your machine, so you can search for the exact record a compaction left out or restore the whole session.",
        hero: {
          heading: "Context compaction you can undo.",
          summary: "Preview the cut, write a smaller session, and keep every original byte in a local vault you can search and restore from.",
          primaryAction: "Install Gobstopper",
          secondaryAction: "See the benchmarks"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    xcb: {
      id: "xcb",
      name: "xcb",
      oneLiner: "Routes coding tasks across the Claude, Codex, and Devin plans you have",
      brandDescription: "xcb routes coding tasks across the Claude, Codex, and Devin subscriptions you already pay for, picking an account that is signed in and idle.",
      canonicalUrl: "https://xcb.sh",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Excalibur", "AgentMixer", "OOMPA", "HRA"],
      messaging: {
        formatVersion: 1,
        product: "xcb",
        names: {
          name: "xcb",
          catalog: "XCB",
          command: "xcb",
          formerly: ["AgentMixer", "OOMPA", "HRA"]
        },
        category: "Agent subscription router",
        tagline: "Keep coding when one subscription hits its limit.",
        short: "Routes coding tasks across the Claude, Codex, and Devin plans you have",
        meta: "xcb routes coding tasks across the Claude, Codex, and Devin subscriptions you already pay for, picking an account that is signed in and idle.",
        medium: "xcb routes coding tasks across the Claude, Codex, and Devin subscriptions you already pay for. Each task runs on an account that is signed in, idle, and not at a known usage limit, on a model that fits the work.",
        long: "xcb is a terminal and router for developers who pay for more than one coding agent. Type the work into one conversation, and xcb sends each task to a Claude, Codex, or Devin account that is signed in, idle, and not at a known usage limit, on a model that fits the job. Tasks keep running after you close the terminal, every session appears on one screen, and each account runs one task at a time. Other agents can hand xcb work with one JSON command. xcb is free and MIT licensed, in preview for macOS and Linux.",
        hero: {
          heading: "Keep coding when one subscription hits its limit.",
          summary: "One terminal for your Claude, Codex, and Devin accounts. Each task runs on an account that is signed in, idle, and not at a known limit.",
          primaryAction: "Install xcb",
          secondaryAction: "View the source"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    aicharts: {
      id: "aicharts",
      name: "AI Charts",
      oneLiner: "Model benchmark scores plotted against cost and tokens per task",
      brandDescription: "AI Charts plots published AI benchmark scores against cost and tokens per task, and a local collector measures your own agents' token use.",
      canonicalUrl: "https://aicharts.io",
      status: "active",
      copyStatus: "proposed",
      aliases: ["CodingChart"],
      messaging: {
        formatVersion: 1,
        product: "aicharts",
        names: {
          name: "AI Charts",
          catalog: "AI CHARTS",
          command: "aicharts",
          formerly: ["CodingChart"]
        },
        category: "AI model comparison charts",
        tagline: "See which model wins at each price.",
        short: "Model benchmark scores plotted against cost and tokens per task",
        meta: "AI Charts plots published AI benchmark scores against cost and tokens per task, and a local collector measures your own agents' token use.",
        medium: "AI Charts plots published AI benchmark scores against cost and tokens per task, marking the best score at every budget. A local collector measures your own agents' token use.",
        long: "Picking a model means guessing at a tradeoff between quality and price, because benchmark scores and prices live in different places. AI Charts plots published benchmark scores against cost and tokens per task on one chart, so the strongest option at each budget is visible instead of implied. A local collector measures your own agents' token use, so the cost question covers your work, not only the models. AI Charts is free and open source.",
        hero: {
          heading: "See which model wins at each price.",
          summary: "Benchmark scores plotted against cost and tokens per task, plus a local collector for your own agents' token use.",
          primaryAction: "Browse the charts",
          secondaryAction: "Measure your agent"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    kb: {
      id: "kb",
      name: "Wordcell",
      oneLiner: "Markdown knowledge base that gives agents the decisions behind code",
      brandDescription: "Wordcell keeps decisions, plans, and sources as Markdown beside your code, so coding agents can find them from the file they are about to change.",
      canonicalUrl: "https://wordcell.io",
      status: "active",
      copyStatus: "proposed",
      aliases: ["KB"],
      messaging: {
        formatVersion: 1,
        product: "wordcell",
        names: {
          name: "Wordcell",
          catalog: "WORDCELL",
          command: "wordcell",
          formerly: ["KB"]
        },
        category: "Markdown knowledge base",
        tagline: "Give the next session what this one learned.",
        short: "Markdown knowledge base that gives agents the decisions behind code",
        meta: "Wordcell keeps decisions, plans, and sources as Markdown beside your code, so coding agents can find them from the file they are about to change.",
        medium: "Wordcell keeps decisions, plans, and sources as Markdown files beside your code. Coding agents find them by exact words, by meaning with an optional local model, or from the file they are about to change.",
        long: "A new coding-agent session can read your code, but not the decisions that stayed in the last session's chat. Wordcell keeps those decisions as Markdown files beside the repository, with the plans that depend on them and the web pages and PDFs that informed them. Tie a note to the paths it explains, and an agent about to change that code runs one command to get the notes and plans for that path. Exact search, backlinks, and Git history run on your machine with no account or model, and every index rebuilds from files you can read in any editor. Wordcell is free and open source.",
        hero: {
          heading: "Give coding agents the decisions behind your code.",
          summary: "Decisions, plans, and sources kept as Markdown beside your repository, one command away from the agent about to change a file.",
          primaryAction: "Install Wordcell",
          secondaryAction: "See a note work"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    "oh-computer": {
      id: "oh-computer",
      name: "Oh",
      oneLiner: "Memory for agents that stores each fact with its sources and history",
      brandDescription: "Oh is open-source memory for agents that stores each fact with its sources and every change in a history you can replay.",
      canonicalUrl: "https://oh.computer",
      status: "active",
      copyStatus: "proposed",
      aliases: ["oh.computer"],
      messaging: {
        formatVersion: 1,
        product: "oh",
        names: {
          name: "Oh",
          catalog: "OH",
          command: "oh"
        },
        category: "Agent memory framework",
        tagline: "Agent memory that shows its work.",
        short: "Memory for agents that stores each fact with its sources and history",
        meta: "Oh is open-source memory for agents that stores each fact with its sources and every change in a history you can replay.",
        medium: "Oh is an open-source memory framework for agents. It stores each fact with the sources it rests on, keeps every change in a history you can replay, and answers with the evidence behind them.",
        long: "Agent memory usually means a vector store: facts go in, answers come out, and nobody can say why. Oh is an open-source memory framework that keeps the reasoning visible. Each fact is stored with the sources it rests on, every change lands in a history you can replay, and queries return the evidence behind the answer. It runs locally as a CLI, SDK, and Agent Skill. Oh is free and MIT licensed.",
        hero: {
          heading: "Agent memory that shows its work.",
          summary: "Store each fact with the sources it rests on, keep every change in a replayable history, and get answers with their evidence.",
          primaryAction: "Install Oh",
          secondaryAction: "See the memory model"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    sponge: {
      id: "sponge",
      name: "Sponge",
      oneLiner: "Private library for what you read, with notes your agent can cite",
      brandDescription: "Sponge is a private library for the articles and PDFs you read, with notes and highlights your AI agent can read and cite.",
      canonicalUrl: "https://sponge.computer",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "sponge",
        names: {
          name: "Sponge",
          catalog: "SPONGE",
          command: "sponge"
        },
        category: "Private research library",
        tagline: "A private library your AI agent can read and cite.",
        short: "Private library for what you read, with notes your agent can cite",
        meta: "Sponge is a private library for the articles and PDFs you read, with notes and highlights your AI agent can read and cite.",
        medium: "Sponge is a private library for articles and PDFs. Save a page as a dated, readable copy, highlight what matters, and keep notes beside it, all readable and citable by your agent.",
        long: "Reading for research means scattered tabs, PDFs in downloads, and highlights in three places. Sponge is a private library for the articles and papers you read: save a page as a dated, readable copy, highlight what matters, and keep notes beside it. Because everything sits in one private library, your AI agent can read it through the API and cite it when it writes. Research tools connect what you saved into cited knowledge.",
        hero: {
          heading: "A private library your AI agent can read and cite.",
          summary: "Save articles and PDFs as dated, readable copies with your highlights and notes, and let your agent cite them when it writes.",
          primaryAction: "Start your library",
          secondaryAction: "See a saved page"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    algal: {
      id: "algal",
      name: "ALGAL",
      oneLiner: "Language and VM for agent programs that wait for approval and resume",
      brandDescription: "ALGAL is a programming language and VM for AI agent programs that wait for approval and leave receipts you can replay.",
      canonicalUrl: "https://algal.computer",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Morphogen"],
      messaging: {
        formatVersion: 1,
        product: "algal",
        names: {
          name: "ALGAL",
          catalog: "ALGAL",
          command: "algal",
          formerly: ["Morphogen"]
        },
        category: "Agent programming language",
        tagline: "Write agent programs that wait, resume, and replay.",
        short: "Language and VM for agent programs that wait for approval and resume",
        meta: "ALGAL is a programming language and VM for AI agent programs that wait for approval and leave receipts you can replay.",
        medium: "ALGAL is a programming language and VM for AI agent programs. A program can wait for your approval, pick up after a crash, and replay what it did from its receipts.",
        long: "Agent programs today are scripts: they run start to finish and leave a log. ALGAL is a programming language and virtual machine for programs that live longer than one run. An ALGAL program can pause to wait for your approval, survive a crash without redoing finished work, and replay exactly what it did from the receipts it leaves. The VM is previewing now, and the language toolchain ships with it. ALGAL is free and open source.",
        hero: {
          heading: "Write agent programs that wait, resume, and replay.",
          summary: "Write agent programs that can wait for approval, survive a crash, and replay their runs from the receipts they leave.",
          primaryAction: "Install ALGAL",
          secondaryAction: "See a program run"
        },
        channels: {
          homebrew: "Language and VM for agent programs that wait and resume"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    valhalla: {
      id: "valhalla",
      name: "vhalla",
      oneLiner: "Peer-to-peer rooms where agents and their owners share signed work",
      brandDescription: "Valhalla is open-source software for peer-to-peer rooms where AI agents and their owners share signed work, with no platform in the middle.",
      canonicalUrl: "https://vhalla.com",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Valhalla"],
      messaging: {
        formatVersion: 1,
        product: "valhalla",
        names: {
          name: "Valhalla",
          catalog: "VALHALLA",
          command: "vhalla"
        },
        category: "Peer-to-peer agent rooms",
        tagline: "A meeting place for agents, run by the people in it.",
        short: "Peer-to-peer rooms where agents and their owners share signed work",
        meta: "Valhalla is open-source software for peer-to-peer rooms where AI agents and their owners share signed work, with no platform in the middle.",
        medium: "Valhalla is open-source software for peer-to-peer rooms shared by AI agents and the people who run them. Every post is signed by the key that wrote it.",
        long: "Agents do more of their work in shared rooms, and most rooms belong to a platform that can read, rank, and revoke them. Valhalla is open-source software for peer-to-peer rooms where agents and their owners meet directly. Every post is signed by the key that wrote it, so reputation attaches to the key and not to an account a platform controls. The people in a room run it together. Valhalla is free and MIT licensed.",
        hero: {
          heading: "A meeting place for agents, run by the people in it.",
          summary: "Open peer-to-peer rooms where agents and their owners share signed work, with no platform in the middle.",
          primaryAction: "Enter a room",
          secondaryAction: "How signing works"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    "valhalla-album": {
      id: "valhalla-album",
      name: "VALHALLA (ALBUM)",
      oneLiner: "Five-track ambient album released as a draft and revised in public",
      brandDescription: null,
      canonicalUrl: "https://hraness.com/valhalla",
      status: "active",
      copyStatus: "proposed",
      aliases: ["valhalla"],
      messaging: {
        formatVersion: 1,
        product: "valhalla-album",
        names: {
          name: "valhalla",
          catalog: "VALHALLA (ALBUM)"
        },
        category: "Ambient electronic album",
        tagline: "Hear an album being revised in public.",
        short: "Five-track ambient album released as a draft and revised in public",
        meta: "valhalla is a five-track ambient electronic album by Hraness, released as a draft and revised in public on Soundfish.",
        medium: "valhalla is a five-track ambient electronic album by Hraness, about 11 minutes long, released as a draft and revised in public. Listen free on Soundfish.",
        long: "valhalla is a five-track ambient electronic album by Hraness, about 11 minutes long. It was released as a draft and is being revised in public: each track keeps its takes in order on Soundfish, so you can hear the album change as it is finished. Listening needs no account. The draft is the point of the release: an album is usually finished in private and published once, while valhalla stays open, so each revision leaves a dated earlier take behind it.",
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    peopleblade: {
      id: "peopleblade",
      name: "PeopleBlade",
      oneLiner: "Local personal CRM for everyone you know, built for your agent",
      brandDescription: "PeopleBlade is a local personal CRM for everyone you know, built for your agent. Bring contacts from apps and exports into one private book.",
      canonicalUrl: "https://peopleblade.com",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "peopleblade",
        names: {
          name: "PeopleBlade",
          catalog: "PEOPLEBLADE",
          command: "peopleblade"
        },
        category: "Local personal CRM",
        tagline: "Keep everyone you know in one private book.",
        short: "Local personal CRM for everyone you know, built for your agent",
        meta: "PeopleBlade is a local personal CRM for everyone you know, built for your agent. Bring contacts from apps and exports into one private book.",
        medium: "PeopleBlade brings your contacts from Apple Contacts, iMessage, Google Contacts, WhatsApp, LinkedIn, and more into one private book on your computer. Keep notes beside each person, and let your agent search the book from the command line.",
        long: "PeopleBlade is a local personal CRM for everyone you know. It imports contacts from Apple Contacts, iMessage, Google Contacts, Beeper, WhatsApp, and your LinkedIn, Instagram, and X data exports into one SQLite database on your computer, and every detail keeps the source it came from. Likely duplicates wait for your review, and a shared name is never enough to join two people. Write private notes beside each person, or let your agent search and research the book with JSON commands. Your agent never receives your passwords, and imports keep no message text. The CLI is free and MIT licensed.",
        headlines: ["every import keeps its source."],
        hero: {
          heading: "Keep everyone you know in one private book.",
          summary: "Bring contacts from your phone, messaging apps, and data exports into one private book on your computer, searchable by your agent.",
          primaryAction: "Install the free CLI",
          secondaryAction: "See the workspace"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    "message-like-me": {
      id: "message-like-me",
      name: "Textbutler",
      oneLiner: "AI butler for the iMessage, WhatsApp, and Beeper chats you choose",
      brandDescription: "Textbutler is an AI butler for the iMessage, WhatsApp, and Beeper chats you choose. It runs on your Mac and answers as a clearly marked assistant.",
      canonicalUrl: "https://textbutler.app",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Message Like Me"],
      messaging: {
        formatVersion: 1,
        product: "textbutler",
        names: {
          name: "Textbutler",
          catalog: "TEXTBUTLER",
          command: "textbutler",
          formerly: ["Message Like Me"]
        },
        category: "Messaging assistant for Mac",
        tagline: "Your AI butler replies in the chats you choose.",
        short: "AI butler for the iMessage, WhatsApp, and Beeper chats you choose",
        meta: "Textbutler is an AI butler for the iMessage, WhatsApp, and Beeper chats you choose. It runs on your Mac and answers as a clearly marked assistant.",
        medium: "Textbutler is an AI butler for the iMessage, WhatsApp, and Beeper chats you choose on your Mac. Turn it on for one person, and it replies as a clearly marked assistant that knows your history with them.",
        long: "Textbutler is an AI butler for your messages, running on your Mac. Turn it on for the chats you choose in iMessage, WhatsApp, or Beeper, and it replies as a clearly marked assistant that keeps notes on each person in a folder you can open and edit. Automatic replies stay off until you connect an AI account, turn them on for a contact, and resume the butler. The AI provider you connect sees the context it needs to write a reply. Textbutler is free and MIT licensed.",
        hero: {
          heading: "Your AI butler replies in the chats you choose.",
          summary: "Turn it on for one person on iMessage, WhatsApp, or Beeper, and it replies as a clearly marked assistant that knows your history with them.",
          primaryAction: "Set up on your Mac",
          secondaryAction: "How replies stay off"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    wrench: {
      id: "wrench",
      name: "Ghostget",
      oneLiner: "Named web actions for AI agents: read pages, save media, use connected accounts",
      brandDescription: "Ghostget lets your AI agent read pages, save media, and use your connected accounts through a fixed list of reviewed actions. Free and MIT licensed.",
      canonicalUrl: "https://ghostget.com",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Wrench"],
      messaging: {
        formatVersion: 1,
        product: "ghostget",
        names: {
          name: "Ghostget",
          catalog: "GHOSTGET",
          command: "ghostget",
          formerly: ["Wrench"]
        },
        category: "Web actions for agents",
        tagline: "Your agent calls web actions by name and holds no password.",
        short: "Named web actions for AI agents: read pages, save media, use connected accounts",
        meta: "Ghostget gives your AI agent named web actions: read a page, archive one media item, or use a connected account, without credentials or a browser to steer.",
        medium: "Ghostget gives the agent you already use a fixed list of reviewed web actions: read a page, save one media item, or act in a connected account. Your agent never sees your credentials and never steers a browser.",
        long: "Agents that run commands reach the web through a browser they steer click by click, or through credentials they should never hold. Ghostget is a free, open-source CLI and TypeScript SDK that gives them a third route: a fixed list of reviewed web actions. Read a URL as Markdown, keep a searchable copy on your machine, archive one media item with SHA-256 records, or act in a connected account such as Gmail, Beeper, or X through one named operation. A measured article read costs about 3,800 tokens where the raw page carries 36,000. Consequential writes need an exact preview and your confirmation, and the agent never sees a login.",
        hero: {
          heading: "Your agent calls web actions by name and holds no password.",
          summary: "Install the CLI or tell your agent to. It reads a page, archives one media item, or acts in an account you connected, and returns the result instead of a browser to steer.",
          primaryAction: "Tell your agent",
          secondaryAction: "See it work"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    soulscrape: {
      id: "soulscrape",
      name: "soulscrape",
      oneLiner: "Free agent skill that writes dated dossiers on people, sources cited",
      brandDescription: "Soulscrape is a free agent skill that writes a dated dossier on a person, with every claim tied to its sources, kept private or published.",
      canonicalUrl: "https://soulscrape.com",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Ensoul"],
      messaging: {
        formatVersion: 1,
        product: "soulscrape",
        names: {
          name: "Soulscrape",
          catalog: "SOULSCRAPE",
          command: "@hraness/soulscrape",
          formerly: ["Ensoul"]
        },
        category: "People research for agents",
        tagline: "See how someone thinks, and where every claim comes from.",
        short: "Free agent skill that writes dated dossiers on people, sources cited",
        meta: "Soulscrape is a free agent skill that writes a dated dossier on a person, with every claim tied to its sources, kept private or published.",
        medium: "Soulscrape is a free agent skill that writes a dated dossier on how a person decides, writes, argues, and changes their mind, with every claim tied to its sources. Keep it private, or publish it.",
        long: "Soulscrape is a free, MIT-licensed agent skill that turns sources you're allowed to use into a dated dossier on one person: how they decide, write, argue, and change their mind. It runs inside Claude Code, Codex, or another agent that loads skills, with your own model and tools, and needs no Soulscrape account. Facts, stated beliefs, patterns, and speculation stay apart, and the dossier lists what the record cannot settle. Keep it private, or publish it with a free Hraness account as a web page, a JSON packet, and a Markdown copy anyone can cite.",
        hero: {
          heading: "See how someone thinks, and where every claim comes from.",
          summary: "Give your agent the sources you're allowed to use, and it writes a dated dossier with every claim tied to its evidence.",
          primaryAction: "Install the skill",
          secondaryAction: "Browse the dossiers"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    slopcamera: {
      id: "slopcamera",
      name: "Slopcamera",
      oneLiner: "Media studio for agents: images, 3D, animation, and video to revise",
      brandDescription: "Slopcamera lets your coding agent make images, diagrams, animation, 3D scenes, and video from source files it can keep revising.",
      canonicalUrl: "https://slopcamera.com",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Atet", "Graphics"],
      messaging: {
        formatVersion: 1,
        product: "slopcamera",
        names: {
          name: "Slopcamera",
          catalog: "SLOPCAMERA",
          command: "slopcamera",
          formerly: ["Atet", "Graphics"]
        },
        category: "Media studio for agents",
        tagline: "Visual work your agent can keep revising.",
        short: "Media studio for agents: images, 3D, animation, and video to revise",
        meta: "Slopcamera lets your coding agent make images, diagrams, animation, 3D scenes, and video from source files it can keep revising.",
        medium: "Slopcamera is a media studio for coding agents. Codex, Claude Code, and other agents make images, diagrams, animation, 3D scenes, and edited video from source files they can keep revising.",
        long: "Agents that write code can also make media, but generated assets usually arrive as finished files nobody can change. Slopcamera is a media studio for coding agents: images, diagrams, animation, 3D scenes, and edited video are built from source files the agent can keep revising, so a change is a new render, not a new prompt lottery. Codex, Claude Code, and other command-capable agents drive it through the CLI and skill. Slopcamera is free and open source.",
        hero: {
          heading: "Visual work your agent can keep revising.",
          summary: "Images, diagrams, animation, 3D scenes, and edited video, built from source files so a change is a re-render, not a re-roll.",
          primaryAction: "Install Slopcamera",
          secondaryAction: "See what agents made"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    soundfish: {
      id: "soundfish",
      name: "Soundfish",
      oneLiner: "Album pages with a waveform player and comments pinned to moments",
      brandDescription: "Soundfish gives your album a page of its own, with a waveform player and comments pinned to moments. Upload a new take and listeners hear it at the same link.",
      canonicalUrl: "https://sound.fish",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "soundfish",
        names: {
          name: "Soundfish",
          catalog: "SOUNDFISH",
          command: "soundfish"
        },
        category: "Album pages for musicians",
        tagline: "Give your album a page of its own.",
        short: "Album pages with a waveform player and comments pinned to moments",
        meta: "Soundfish gives your album a page of its own, with a waveform player and comments pinned to moments. Upload a new take and listeners hear it at the same link.",
        medium: "Soundfish gives your album a page of its own, with a waveform player and comments pinned to moments. Upload a new take and listeners hear it at the same link while earlier takes stay dated.",
        long: "Soundfish gives your album a page of its own. Upload MP3, WAV, or FLAC tracks and share one link to a waveform player where listeners heart tracks and pin comments to the moment they mean. Each track keeps its takes in order: upload a new one and listeners hear it at the same link, while earlier takes stay dated. Keep an album unlisted, publish it to your artist page, or embed the player on any site. Listening needs no account; a free Hraness account publishes one album of up to 10 tracks. Agents can publish with the soundfish CLI, and a browser MIDI editor is in beta.",
        hero: {
          heading: "Give your album a page of its own.",
          summary: "Upload tracks and share one link to a waveform player with hearts and comments pinned to the moment. A new take lands at the same link.",
          primaryAction: "Upload an album",
          secondaryAction: "Hear an album page"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    sys1: {
      id: "sys1",
      name: "Sys1",
      oneLiner: "Lets agents ask yes/no, choice, and score questions and get answers",
      brandDescription: "Sys1 lets agents ask yes/no, choice, and score questions and get validated answers with probabilities from hosted Jev, a local model, or your own server.",
      canonicalUrl: "https://sys1.io",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "sys1",
        names: {
          name: "Sys1",
          catalog: "SYS1",
          command: "sys1"
        },
        category: "Agent decision router",
        tagline: "Give your agent a System 1.",
        short: "Lets agents ask yes/no, choice, and score questions and get answers",
        meta: "Sys1 lets agents ask yes/no, choice, and score questions and get validated answers with probabilities from hosted Jev, a local model, or your own server.",
        medium: "Sys1 lets agents ask yes/no, choice, and score questions and get validated answers with probabilities. You choose who answers: TypeSafe's hosted Jev, a local model on your machine, or a compatible server you run.",
        long: "Sys1 lets agents ask yes/no, choice, and score questions and get validated answers with probabilities. You choose who answers: TypeSafe's hosted Jev, a local model on your machine, or a compatible server you run. Every backend takes the same request format, Sys1 checks each answer against the question asked, and each response says which backend produced it. Call Sys1 from a Node or Bun client, embed its router, or run its local HTTP daemon for any language. Sys1 is free and MIT licensed.",
        hero: {
          heading: "Give your agent a System 1.",
          summary: "Your agent asks small yes/no, choice, and score questions and gets validated answers with probabilities. You choose the model.",
          primaryAction: "Install Sys1",
          secondaryAction: "Read the evaluations"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    sloptrade: {
      id: "sloptrade",
      name: "SlopTrade",
      oneLiner: "Build prompt that turns a coding agent into a trading-system designer",
      brandDescription: "SlopTrade is a build prompt your coding agent turns into a personal stock trading system, where your rules approve every order.",
      canonicalUrl: "https://sloptrade.com",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Invest"],
      messaging: {
        formatVersion: 1,
        product: "sloptrade",
        names: {
          name: "SlopTrade",
          catalog: "SLOPTRADE",
          command: "sloptrade",
          formerly: ["Invest"]
        },
        category: "Trading system build prompt",
        tagline: "Design an AI trading system that fails closed.",
        short: "Build prompt that turns a coding agent into a trading-system designer",
        meta: "SlopTrade is a build prompt your coding agent turns into a personal stock trading system, where your rules approve every order.",
        medium: "SlopTrade is a build prompt your coding agent turns into a personal stock trading system. AI writes the research and scans for setups, and your rules approve every order.",
        long: "SlopTrade is a build prompt: a researched architecture and specification your coding agent turns into a personal stock trading system. AI writes the research and scans for setups; your rules approve every order, and the system fails closed when evidence is missing or limits are hit. You end with a trading system you built and can inspect end to end, not a black box that trades for you. The prompt and its architecture are documented in the repository.",
        hero: {
          heading: "AI writes the research. Your rules make the trade.",
          summary: "A researched build prompt your coding agent turns into a personal trading system where your rules approve every order.",
          primaryAction: "Get the prompt",
          secondaryAction: "Read the architecture"
        },
        status: {
          default: "proposed",
          tagline: "authored"
        },
        reviewedOn: "2026-09-24"
      }
    },
    hraness: {
      id: "hraness",
      name: "Hraness",
      oneLiner: "Software studio making tools for AI agents and for people",
      brandDescription: "Hraness is a software studio that makes tools for AI agents and for people, from agent memory to music. Most are open source.",
      canonicalUrl: "https://hraness.com",
      status: "active",
      copyStatus: "proposed",
      aliases: ["HaRNeSS"],
      messaging: {
        formatVersion: 1,
        product: "hraness",
        names: {
          name: "Hraness",
          catalog: "HRANESS"
        },
        category: "Software studio",
        tagline: "Tools for agents and humans.",
        short: "Software studio making tools for AI agents and for people",
        meta: "Hraness is a software studio that makes tools for AI agents and for people, from agent memory to music. Most are open source.",
        medium: "Hraness is a software studio in Puerto Rico. We build tools that give AI agents memory, context, web access, and a record of their work, and we make apps and sourced archives for people.",
        long: "Hraness is a software studio in Puerto Rico. We build tools for AI agents and for people, and we publish what we learn building them. For agents, that means memory and research libraries, context compaction, web capture, and a programming language for agent programs that can wait for approval and replay their runs. For people, it means music software, life timelines, model benchmark charts, and sourced company histories. The projects share one design: your material stays in formats you control, work leaves a record you can check, and permission stays with the owner. Most of them are open source.",
        hero: {
          heading: "Tools for agents and humans.",
          summary: "Hraness is a software studio. We build tools that give AI agents memory, context, web access, and a record of their work, and we make apps and archives for people.",
          primaryAction: "See all projects",
          secondaryAction: "Get email updates"
        },
        status: {
          default: "proposed",
          tagline: "authored"
        },
        reviewedOn: "2026-09-24"
      }
    },
    sleepyland: {
      id: "sleepyland",
      name: "Sleepyland",
      oneLiner: "Free sleep sounds made in your browser, with sourced sleep guides",
      brandDescription: "Sleepyland is a free sound machine that makes brown, pink, or white noise and ocean waves in your browser, with sourced guides to sleep.",
      canonicalUrl: "https://sleepy.land",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "sleepyland",
        names: {
          name: "Sleepyland",
          catalog: "SLEEPYLAND"
        },
        category: "Sleep sound machine",
        tagline: "Steady sound for sleep, made in your browser.",
        short: "Free sleep sounds made in your browser, with sourced sleep guides",
        meta: "Sleepyland is a free sound machine that makes brown, pink, or white noise and ocean waves in your browser, with sourced guides to sleep.",
        medium: "Sleepyland is a free sound machine that makes brown, pink, or white noise and ocean waves in your browser as you listen, with no recordings, account, or ads. Beside it are sourced guides to sleep.",
        long: "Sleepyland is a free sound machine that runs in your browser. Press play and it makes brown, pink, or white noise and ocean surf on your device as you listen, with no recordings to download and no account to create. Start from Sleep, Relax, or Focus, then tune the noise color, warmth, volumes, and the time between waves. Beside the sound machine, Sleepyland publishes short guides to sleep, sound, and light that link every source. It is open source under the MIT License and built by Hraness.",
        hero: {
          heading: "Steady sound for sleep, made in your browser.",
          summary: "Press play for deep brown noise and slow ocean waves, made on your device as you listen. Free, no account, and every guide links its sources.",
          primaryAction: "Play sound",
          secondaryAction: "Read the guides"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    roughday: {
      id: "roughday",
      name: "Rough Day",
      oneLiner: "Daily front page that says why each story ranked and links its source",
      brandDescription: "Rough Day is a daily front page for Tech & AI, World, and Finance that says why each story ranked: up to six per section, each linked to its source.",
      canonicalUrl: "https://rough.day",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "roughday",
        names: {
          name: "Rough Day",
          catalog: "ROUGH DAY"
        },
        category: "Daily news digest",
        tagline: "A daily front page that says why each story ranked.",
        short: "Daily front page that says why each story ranked and links its source",
        meta: "Rough Day is a daily front page for Tech & AI, World, and Finance that says why each story ranked: up to six per section, each linked to its source.",
        medium: "Rough Day is a daily front page for Tech & AI, World, and Finance that says why each story ranked. Each edition covers the previous 24 hours, with up to six stories per section and a link to every source.",
        long: "Rough Day is a daily front page for Tech & AI, World, and Finance that says why each story ranked. Each edition considers reporting from the previous 24 hours and publishes up to six stories per section. Every story carries a short summary, a note on why it ranked, and a link to the original article or post, so you can scan the day and open only the sources you need. Newspapers have been called the rough draft of history since at least 1905, and Rough Day files one draft a day. Reading is free and needs no account.",
        hero: {
          heading: "A daily front page that says why each story ranked.",
          summary: "Tech & AI, World, and Finance, one dated edition a day. Every story links the original source.",
          primaryAction: "Read today's edition",
          secondaryAction: "See the archive"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    "stripe-history": {
      id: "stripe-history",
      name: "STRIPE HISTORY",
      oneLiner: "Independent history of Stripe where every event is dated and sourced",
      brandDescription: null,
      canonicalUrl: "https://hraness.com/stripe",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Stripe Guide", "Stripedex"],
      messaging: {
        formatVersion: 1,
        product: "stripe-history",
        names: {
          name: "Stripe History",
          catalog: "STRIPE HISTORY",
          formerly: ["Stripe Guide", "Stripedex"]
        },
        category: "Independent company history",
        tagline: "Every event in Stripe's history, dated and sourced.",
        short: "Independent history of Stripe where every event is dated and sourced",
        meta: "Stripe History is an independent record of how Stripe grew. Every event is dated and linked to its sources, and the data downloads as open YAML.",
        medium: "Stripe History is an independent record of how Stripe grew, from the Collison brothers' first projects to today. Every event is dated and linked to its sources, and reported deals stay separate from completed ones.",
        long: "Stripe is private, so its history arrives in pieces: annual letters, tender offers, press reports, podcasts, and blog posts. Stripe History, built by Hraness, gathers those pieces into one dated record, from Patrick Collison's 2005 Young Scientist win and the 2010 prototype built in Buenos Aires cafes to the $1.9 trillion in total volume Stripe reported for 2025. Every event links to its sources, reported talks stay distinct from completed deals, and each valuation keeps its type. Charts follow volume, revenue, and valuation by year, and the whole record downloads as YAML under the MIT License. It is not affiliated with Stripe, Inc.",
        hero: {
          heading: "Every event in Stripe's history, dated and sourced.",
          summary: "An independent, dated record of how Stripe grew, from the 2010 Buenos Aires prototype to the latest reported volume. Open data throughout.",
          primaryAction: "Browse the timeline",
          secondaryAction: "Download the data"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    "eds-research": {
      id: "eds-research",
      name: "EDS RESEARCH INDEX",
      oneLiner: "Ehlers-Danlos evidence stratified by kind, every record linked to sources",
      brandDescription: null,
      canonicalUrl: "https://hraness.com/eds",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "eds-research",
        names: {
          name: "EDS Research Index",
          catalog: "EDS RESEARCH INDEX"
        },
        category: "Medical research index",
        tagline: "Ehlers-Danlos research, sorted by kind of evidence.",
        short: "Ehlers-Danlos evidence stratified by kind, every record linked to sources",
        meta: "EDS Research Index is an independent, open-source index of Ehlers-Danlos syndromes research that links each record's sources and labels the kind of evidence.",
        medium: "EDS Research Index is an independent index of Ehlers-Danlos syndromes research for patients and clinicians. Each record links its sources and labels the kind of evidence behind it.",
        long: "Ehlers-Danlos syndromes are underdiagnosed and the research is scattered across journals, registries, and patient communities. EDS Research Index is an independent, open-source index that collects the research record by record. Each entry links its sources and labels the kind of evidence behind it, so a reader can tell a cohort study from a case report. It is a reference, not medical advice, built by Hraness and published in the open.",
        hero: {
          heading: "Ehlers-Danlos research, sorted by kind of evidence.",
          summary: "An independent index that links each record's sources and labels the kind of evidence behind it.",
          primaryAction: "Browse the index",
          secondaryAction: "Read the method"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    act60: {
      id: "act60",
      name: "act60.me",
      oneLiner: "Estimate Act 60 savings after real costs, with sourced guides and a day tracker",
      brandDescription: "act60.me estimates Puerto Rico Act 60 savings after fees and yearly costs. Sourced guides cover applying, residency, and moving; a private tracker counts days.",
      canonicalUrl: "https://act60.me",
      status: "active",
      copyStatus: "proposed",
      aliases: ["ACT60"],
      messaging: {
        formatVersion: 1,
        product: "act60",
        names: {
          name: "act60.me",
          catalog: "ACT60"
        },
        category: "Act 60 planner",
        tagline: "Model the move to Puerto Rico before you make it.",
        short: "Estimate Act 60 savings after real costs, with sourced guides and a day tracker",
        meta: "act60.me estimates Puerto Rico Act 60 savings after fees and yearly costs. Sourced guides cover applying, residency, and moving; a private tracker counts days.",
        medium: "act60.me estimates Puerto Rico Act 60 savings after fees and yearly costs, with every assumption and source date beside the result. Sourced guides cover applying, federal residency, and moving; a private tracker counts your presence days.",
        long: "Act 60 promises large Puerto Rico tax savings, but fees, yearly costs, and the federal residency rules decide the real number. act60.me models the move before you make it: a calculator that itemizes one-time and annual costs beside its assumptions, guides that cite the official sources and the date each was checked, and a private day tracker for the presence tests a calendar can measure. Investor applications filed in 2026 face a December 31 deadline; the guides say which rules changed and which still apply.",
        hero: {
          heading: "Model the move to Puerto Rico",
          summary: "Estimate your Act 60 savings after fees and yearly costs, with every assumption and source date beside the result.",
          primaryAction: "Estimate your savings",
          secondaryAction: "Choose your guide"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    direct: {
      id: "direct",
      name: "DIRECT",
      oneLiner: "Repeatable app states for browser agents, opened by URL",
      brandDescription: null,
      canonicalUrl: "https://hraness.com/direct",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "direct",
        names: {
          name: "Direct",
          catalog: "DIRECT",
          command: "@hraness/direct"
        },
        category: "Frontend testing library",
        tagline: "Give each app state you test its own URL.",
        short: "Repeatable app states for browser agents, opened by URL",
        meta: "Direct gives browser agents repeatable app states that open by URL, with your real interface running on fixture data.",
        medium: "Direct gives browser agents repeatable app states for frontend testing. This development-only TypeScript library serves signed-in, empty, and edge-case states on fixture data, each at its own URL.",
        long: "Testing a frontend means reaching the states: signed in, empty, mid-error, edge cases that take real setup to reach by clicking. Direct is a development-only TypeScript library that gives each app state its own URL. A browser agent opens the URL and gets your real interface running on fixture data, so the same state can be opened, tested, and shared every time. Direct is free, MIT licensed, and stays out of production bundles.",
        hero: {
          heading: "Give each app state you test its own URL.",
          summary: "Repeatable states for browser agents: your real interface on fixture data, at a URL you can open, test, and share.",
          primaryAction: "Add Direct to a project",
          secondaryAction: "See a named state"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    clankdar: {
      id: "clankdar",
      name: "Clankdar",
      oneLiner: "Fresh puzzles for AI agents, scored exactly, with a signed receipt",
      brandDescription: "Clankdar gives AI agents fresh puzzles to solve, scores their answers exactly, and signs a receipt anyone can recheck.",
      canonicalUrl: "https://clankdar.com",
      status: "active",
      copyStatus: "proposed",
      aliases: ["botcaptcha"],
      messaging: {
        formatVersion: 1,
        product: "clankdar",
        names: {
          name: "Clankdar",
          catalog: "CLANKDAR",
          command: "clankdar",
          formerly: ["botcaptcha"]
        },
        category: "Agent capability checks",
        tagline: "Check what your agent can solve.",
        short: "Fresh puzzles for AI agents, scored exactly, with a signed receipt",
        meta: "Clankdar gives AI agents fresh puzzles to solve, scores their answers exactly, and signs a receipt anyone can recheck.",
        medium: "Clankdar checks what AI agents can solve. Each check gives your agent fresh puzzles, scores every answer exactly, and signs a receipt that anyone can recheck.",
        long: "Benchmark scores age: suites leak into training data and results stop meaning anything. Clankdar gives AI agents fresh puzzles to solve, scores the answers exactly, and signs a receipt that anyone can recheck later. It is a public capability check for the agent internet: reproducible, dated, and inspectable. Run a check on the agent you use, then verify the receipt without trusting Clankdar or the agent's maker. It is free to run.",
        hero: {
          heading: "Check what your agent can solve.",
          summary: "Fresh puzzles, exact scoring, and a signed receipt anyone can recheck.",
          primaryAction: "Run a check",
          secondaryAction: "Verify a receipt"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    lifedaysleft: {
      id: "lifedaysleft",
      name: "LIFECHARTS",
      oneLiner: "Turn the chapters of your life into one timeline you can share",
      brandDescription: null,
      canonicalUrl: "https://lifecharts.io",
      status: "active",
      copyStatus: "proposed",
      aliases: ["Life Days Left", "lifedaysleft"],
      messaging: {
        formatVersion: 1,
        product: "lifecharts",
        names: {
          name: "Lifecharts",
          catalog: "LIFECHARTS",
          command: "lifecharts",
          formerly: ["Life Days Left", "lifedaysleft"]
        },
        category: "Life timeline maker",
        tagline: "Chart your life in chapters.",
        short: "Turn the chapters of your life into one timeline you can share",
        meta: "Lifecharts turns the chapters of your life into one timeline you can share as a link or embed on your own site.",
        medium: "Lifecharts is a free life timeline maker. Add the chapters of your life, like a city, a school, a job, or a relationship, by hand or with your agent, and share the result.",
        long: "A life is long and memory keeps it unordered. Lifecharts is a free timeline maker: add the chapters of your life, a city, a school, a job, a relationship, and see them laid out in order on one line. Share it as a link or embed it on your site, and let your agent help fill it in through the CLI or skill. Lifecharts is free and open source.",
        hero: {
          heading: "Chart your life in chapters.",
          summary: "Add the cities, schools, jobs, and relationships, and see your life laid out on one line you can share.",
          primaryAction: "Start your timeline",
          secondaryAction: "See an example"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    },
    swft: {
      id: "swft",
      name: "SWFT",
      oneLiner: "Free publication about how companies put AI agents to work",
      brandDescription: "SWFT is a free publication about how companies put AI agents to work, comparing named companies' systems and keeping each figure beside its limits.",
      canonicalUrl: "https://swft.io",
      status: "active",
      copyStatus: "proposed",
      aliases: [],
      messaging: {
        formatVersion: 1,
        product: "swft",
        names: {
          name: "SWFT",
          catalog: "SWFT"
        },
        category: "Software factory publication",
        tagline: "How companies put AI agents to work.",
        short: "Free publication about how companies put AI agents to work",
        meta: "SWFT is a free publication about how companies put AI agents to work, comparing named companies' systems and keeping each figure beside its limits.",
        medium: "SWFT is a free publication about software factories, the repeatable systems where AI agents do scoped work while checks and people decide what ships. It compares how named companies run them.",
        long: "SWFT is a free publication from Hraness about software factories, the repeatable systems where AI agents do scoped work while automated checks and people decide what ships. Its company cases, including Stripe, Shopify, Jane Street, and Capital One, show how work reaches the agents, what checks it, and where a person decides, and one table compares every case on the same fields. A scale reference compares reported agent numbers and keeps each figure beside its unit and limits. Every article links its sources.",
        hero: {
          heading: "How companies put AI agents to work.",
          summary: "A free publication about software factories: reported company cases and scale figures, every article linked to its sources.",
          primaryAction: "Read the latest",
          secondaryAction: "Compare the cases"
        },
        status: {
          default: "proposed"
        },
        reviewedOn: "2026-09-24"
      }
    }
  },
  relations: [{
    id: "runtime:lifedaysleft:slopcamera:uses",
    source: "lifedaysleft",
    target: "slopcamera",
    kind: "runtime",
    direction: "forward",
    label: "uses",
    detail: null
  }, {
    id: "development:roughday:direct:develops-with",
    source: "roughday",
    target: "direct",
    kind: "development",
    direction: "forward",
    label: "develops with",
    detail: null
  }, {
    id: "delivery:stripe-history:hraness:published-at-stripe",
    source: "stripe-history",
    target: "hraness",
    kind: "delivery",
    direction: "forward",
    label: "published at /stripe",
    detail: "Hraness proxies the standalone Stripe History data application under its canonical /stripe route."
  }, {
    id: "delivery:eds-research:hraness:published-at-eds",
    source: "eds-research",
    target: "hraness",
    kind: "delivery",
    direction: "forward",
    label: "published at /eds",
    detail: "Hraness proxies the standalone EDS research index under its canonical /eds route."
  }, {
    id: "runtime:wrench:kb:ships-kb-workflows",
    source: "wrench",
    target: "kb",
    kind: "runtime",
    direction: "forward",
    label: "ships KB workflows",
    detail: null
  }, {
    id: "contract:wrench:message-like-me:exports-private-bundles",
    source: "wrench",
    target: "message-like-me",
    kind: "contract",
    direction: "forward",
    label: "exports private bundles",
    detail: "Ghostget produces bounded multi-account Beeper bundles that Textbutler verifies and ingests locally."
  }, {
    id: "runtime:peopleblade:wrench:provider-transport",
    source: "peopleblade",
    target: "wrench",
    kind: "runtime",
    direction: "forward",
    label: "provider transport",
    detail: "PeopleBlade uses Ghostget to read contacts and search results from connected accounts such as Beeper and WhatsApp, and checks each result before saving it locally."
  }, {
    id: "contract:message-like-me:peopleblade:shared-bundle-format",
    source: "message-like-me",
    target: "peopleblade",
    kind: "contract",
    direction: "shared",
    label: "shared bundle format",
    detail: "Both tools implement the versioned message-like-me.local-message-bundle interchange without importing each other's private state."
  }, {
    id: "runtime:gobstopper:xcb:compacts-sessions-for",
    source: "gobstopper",
    target: "xcb",
    kind: "runtime",
    direction: "forward",
    label: "compacts sessions for",
    detail: "xcb uses Gobstopper's elision policy to drop stale tool output from Claude Code and Codex prompts once context passes a threshold, and keeps the original output in local history. It is on by default."
  }, {
    id: "contract:xcb:aicharts:exports-sessions-for",
    source: "xcb",
    target: "aicharts",
    kind: "contract",
    direction: "forward",
    label: "exports sessions for",
    detail: "xcb measures subscription usage locally and, when you turn on exports, writes session files in the AI Charts format. Automatic upload is not available."
  }, {
    id: "contract:soulscrape:peopleblade:exports-dossier-packets",
    source: "soulscrape",
    target: "peopleblade",
    kind: "contract",
    direction: "forward",
    label: "exports dossier packets",
    detail: "Soulscrape exports dated dossier packets that PeopleBlade imports and rebinds to contacts during local merge review."
  }, {
    id: "development:slopcamera:direct:develops-with",
    source: "slopcamera",
    target: "direct",
    kind: "development",
    direction: "forward",
    label: "develops with",
    detail: null
  }, {
    id: "delivery:direct:hraness:readme-backed-direct",
    source: "direct",
    target: "hraness",
    kind: "delivery",
    direction: "forward",
    label: "README-backed /direct",
    detail: "Hraness renders the pinned public Direct README and Agent Skill at /direct."
  }, {
    id: "development:soundfish:direct:develops-with",
    source: "soundfish",
    target: "direct",
    kind: "development",
    direction: "forward",
    label: "develops with",
    detail: null
  }, {
    id: "runtime:message-like-me:xcb:drafts-replies-through",
    source: "message-like-me",
    target: "xcb",
    kind: "runtime",
    direction: "forward",
    label: "drafts replies through",
    detail: "Textbutler can classify messages and draft replies through xcb on the Claude Code or Codex subscription you already pay for, with xcb holding the sign-in; a separately billed API route also exists."
  }, {
    id: "runtime:message-like-me:algal:runs-reply-habitats-on",
    source: "message-like-me",
    target: "algal",
    kind: "runtime",
    direction: "forward",
    label: "runs reply habitats on",
    detail: "Textbutler's opt-in per-contact habitats run as ALGAL programs: a candidate reply plan replaces the current one only after a blind replay shows no regression, and no plan can change the recipient, provider, or permissions."
  }, {
    id: "runtime:xcb:algal:replays-task-history-with",
    source: "xcb",
    target: "algal",
    kind: "runtime",
    direction: "forward",
    label: "replays task history with",
    detail: "xcb embeds the ALGAL runtime for task transitions, route and settle reflexes, and resumable controllers, and its task verifier replays a task's recorded history offline; the managed harness is experimental."
  }, {
    id: "runtime:xcb:kb:searches-project-notes-with",
    source: "xcb",
    target: "kb",
    kind: "runtime",
    direction: "forward",
    label: "searches project notes with",
    detail: "xcb can bind one explicit Wordcell vault through a hash-pinned CLI, giving workers a read-only memory search with citations; saving a note back to the vault is always an explicit step."
  }, {
    id: "runtime:clankdar:algal:scores-puzzles-with",
    source: "clankdar",
    target: "algal",
    kind: "runtime",
    direction: "forward",
    label: "scores puzzles with",
    detail: "Clankdar's default puzzles are small programs in ALGAL's expression language, and ALGAL's official evaluator, pinned by commit and hash, computes each reference answer, so no judge model decides."
  }, {
    id: "runtime:slopcamera:algal:bakes-character-behavior-with",
    source: "slopcamera",
    target: "algal",
    kind: "runtime",
    direction: "forward",
    label: "bakes character behavior with",
    detail: "Slopcamera's scene behavior bake runs character behavior as ALGAL organisms with no executors or side effects."
  }, {
    id: "contract:sponge:wrench:imports-captures-from",
    source: "sponge",
    target: "wrench",
    kind: "contract",
    direction: "forward",
    label: "imports captures from",
    detail: "Sponge recommends Ghostget for local capture and imports its text-only capture bundles offline, without launching Ghostget, a browser, or the network."
  }, {
    id: "contract:sponge:soulscrape:imports-research-exchanges-from",
    source: "sponge",
    target: "soulscrape",
    kind: "contract",
    direction: "forward",
    label: "imports research exchanges from",
    detail: "Sponge converts a public soulscrape research exchange offline into an Oh research packet that it does not treat as established fact."
  }],
  digest: "sha256:fa7bcf019c1f92312e51d6d1bf6bfe75710568b19b687497205d2fe0d0a887bb"
};

// src/portfolio.ts
var portfolioRelationKinds = ["runtime", "development", "contract", "delivery"];
var portfolioRelationDirections = ["forward", "shared"];
var portfolioProductStatuses = ["active"];
var portfolioCopyStatuses = ["authored", "proposed"];

class PortfolioFactsError extends Error {
  name = "PortfolioFactsError";
}
function deepFreeze(value) {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value))
      deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
var portfolioFacts = deepFreeze(portfolioSnapshot);
var portfolioProducts = portfolioFacts.products;
var portfolioRelations = portfolioFacts.relations;
var portfolioProvenance = portfolioFacts.provenance;
var portfolioDigest = portfolioFacts.digest;
var portfolioProductIds = Object.freeze(Object.keys(portfolioProducts));
function isPortfolioProductId(value) {
  return typeof value === "string" && Object.hasOwn(portfolioProducts, value);
}
function product(id) {
  if (!isPortfolioProductId(id)) {
    throw new PortfolioFactsError(`Unknown portfolio product: ${String(id)}.`);
  }
  return portfolioProducts[id];
}
function hasDetail(relation) {
  return relation.detail !== null;
}
function relatedFor(id, options = {}) {
  product(id);
  const kinds = options.kinds ?? portfolioRelationKinds;
  const seen = new Set;
  const items = [];
  for (const relation of portfolioRelations) {
    if (!hasDetail(relation) || !kinds.includes(relation.kind))
      continue;
    const otherId = relation.source === id ? relation.target : relation.target === id ? relation.source : null;
    if (otherId === null || otherId === id || seen.has(otherId))
      continue;
    seen.add(otherId);
    const other = product(otherId);
    items.push({
      href: other.canonicalUrl,
      name: other.name,
      role: other.oneLiner,
      relationship: relation.detail,
      productId: other.id,
      relationId: relation.id
    });
  }
  return items;
}
function usesPairs() {
  return portfolioRelations.filter(hasDetail).filter((relation) => relation.kind !== "delivery").map((relation) => ({
    relation,
    source: product(relation.source),
    target: product(relation.target)
  }));
}
export {
  usesPairs,
  relatedFor,
  product,
  portfolioRelations,
  portfolioRelationKinds,
  portfolioRelationDirections,
  portfolioProvenance,
  portfolioProducts,
  portfolioProductStatuses,
  portfolioProductIds,
  portfolioFacts,
  portfolioDigest,
  portfolioCopyStatuses,
  isPortfolioProductId,
  PortfolioFactsError
};
