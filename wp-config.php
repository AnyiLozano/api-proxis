<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'praxis' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'o9.C@1iAo>H|z4|~lxjBVG+Il{cq$fRPcM7-5Sx8?Oz,tNQB{JU;>Z/0- PX#T$*' );
define( 'SECURE_AUTH_KEY',  '4%!LUU0UCgyxRn] lxTR]/C_Vc9->y(R:Og^),^cTY+|Ar2xIne$,E9]jB5R-^.g' );
define( 'LOGGED_IN_KEY',    '$ck(vuHzs44NkL&k/S LX7;fWWyq?IrCr1U3!Fc]E~7iE3W$i{46Vi|c<t3bz cy' );
define( 'NONCE_KEY',        'z*nsr)x;R5+z5SX@:o/i[0O]RiB*H#1/QmqaaixgNjpV-<jEZ~]~tBFE{<Ikl+xY' );
define( 'AUTH_SALT',        'nE*ty{nIT^KbT8wwx 4J9uEw]]V@sa{$v=Ef5)9y!WSU)sRI%?qwYzK)JN!jS)Lr' );
define( 'SECURE_AUTH_SALT', 'Ghv[[ROF:A8,E~TRCfz^l<;veJ+hW9!T>Ls9*v!l#8.is^Jm{Yq9,rq!f09A^4SZ' );
define( 'LOGGED_IN_SALT',   'wp&ulFy!~:poO1Zt}(YOyXD^|*j*l[~Yd3Hb9cH|)c`3!uN_ka6GvF?sq0-o BW+' );
define( 'NONCE_SALT',       '1FYc)wfh [>bz_5$ E3w-9<6DKu1!Szs~Y:$=/>Dk@V@vuNf1+hJ3Yr~Yt},OJGY' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
