CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`product_id` integer,
	`base_size` text NOT NULL,
	`custom_specifications` blob,
	`item_hash` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`price` real NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`tickets_count` integer DEFAULT 1 NOT NULL,
	`additional_notes` text,
	`created_at` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`image_url` text,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`duration` text,
	`age_limit` text,
	`language` text,
	`genre` text,
	`location` text NOT NULL,
	`cost` text NOT NULL,
	`booking_url` text,
	`disclaimer` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `homepage_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`image_url` text NOT NULL,
	`promo_text` text NOT NULL,
	`action_text` text DEFAULT 'Shop Now',
	`link` text,
	`order` integer DEFAULT 0 NOT NULL,
	`filter_types` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `navigation_menu` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	`image_url` text,
	`order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`filter_types` text
);
--> statement-breakpoint
CREATE TABLE `offer_banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`link` text,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer,
	`product_id` integer,
	`variation_id` integer,
	`quantity` integer DEFAULT 1 NOT NULL,
	`price` real NOT NULL,
	`size` text NOT NULL,
	`color` text,
	`customizations` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variation_id`) REFERENCES `product_variations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`total_amount` real NOT NULL,
	`status` text DEFAULT 'pending',
	`shipping_address` text,
	`created_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `otp_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_number` text NOT NULL,
	`otp` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `page_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_id` integer NOT NULL,
	`title` text NOT NULL,
	`product_ids` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`menu_id`) REFERENCES `navigation_menu`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_customisation_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer,
	`attribute_name` text,
	`min_adjustment` real,
	`max_adjustment` real,
	`step` real,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_variations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer,
	`size` text NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`sku` text,
	`color` text,
	`mrp` real,
	`sale_price` real,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`base_price` real NOT NULL,
	`sale_price` real,
	`avg_rating` real DEFAULT 4.3,
	`num_reviews` integer DEFAULT 1,
	`images` text,
	`colors` text,
	`gender` text,
	`category` text,
	`tags` text,
	`is_featured` integer DEFAULT false,
	`is_customizable` integer DEFAULT false,
	`enabled_measurements` text,
	`style` text,
	`fabric_composition` text,
	`weave` text,
	`neck_style` text,
	`key_words` text,
	`filter_category` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_number` text NOT NULL,
	`full_name` text,
	`role` text DEFAULT 'user',
	`address` text,
	`created_at` text,
	`last_login_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_number_unique` ON `users` (`phone_number`);--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`created_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
