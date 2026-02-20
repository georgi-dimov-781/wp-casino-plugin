<?php
/**
 * Plugin Name: Casino Finder
 * Description: A step-by-step quiz widget that helps users find the best online casino based on their preferences.
 * Version:     1.0.0
 * Author:      Georgi Dimov
 * Text Domain: casino-finder
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants.
define( 'CF_VERSION', '1.0.0' );
define( 'CF_PATH', plugin_dir_path( __FILE__ ) );
define( 'CF_URL', plugin_dir_url( __FILE__ ) );

// Load classes.
require_once CF_PATH . 'includes/class-casino-finder.php';

// Boot the plugin.
Casino_Finder::get_instance();
