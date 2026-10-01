import type { NavBarConfig } from "../types/config";
import { LinkPreset } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "项目",
			url: "/projects/",
			icon: "material-symbols:work",
		},
		{
			name: "学习",
			url: "#",
			icon: "material-symbols:school",
			children: [
				{
					name: "技能",
					url: "/skills/",
					icon: "material-symbols:psychology",
				},
				{
					name: "时间线",
					url: "/timeline/",
					icon: "material-symbols:timeline",
				},
			],
		},
		{
			name: "生活",
			url: "#",
			icon: "material-symbols:person",
			children: [
				{
					name: "日记",
					url: "/diary/",
					icon: "material-symbols:book",
				},
				{
					name: "关于我",
					url: "/about/",
					icon: "material-symbols:person",
				},
			],
		},
		{
			name: "GitHub",
			url: "https://github.com/zpooi",
			icon: "fa7-brands:github",
			external: true,
		},
	],
};
