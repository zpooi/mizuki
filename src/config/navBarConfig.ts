import type { NavBarConfig } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		{
			name: "主页",
			url: "/",
			icon: "material-symbols:home",
		},
		{
			name: "文章",
			url: "/",
			icon: "material-symbols:article",
		},
		{
			name: "项目",
			url: "/projects/",
			icon: "material-symbols:work",
		},
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
		{
			name: "相册",
			url: "/albums/",
			icon: "material-symbols:photo-library",
		},
		{
			name: "归档",
			url: "/archive/",
			icon: "material-symbols:archive",
		},
		{
			name: "关于我",
			url: "/about/",
			icon: "material-symbols:person",
		},
	],
};
