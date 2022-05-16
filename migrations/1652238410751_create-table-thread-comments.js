/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('thread_comments',{
        id:{
            type: 'VARCHAR(50)',
            primaryKey:true
        },
        content:{
            type: 'TEXT',
            notNull: true
        },
        thread_id:{
            type: 'VARCHAR(50)',
            notNull: true
        },
        is_delete:{
            type: 'VARCHAR(1)',
            notNull: true
        },
        owner:{
            type: 'VARCHAR(50)',
            notNull: true
        },
        date: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.addConstraint('thread_comments', 'fk_thread_comments.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
};

exports.down = pgm => {};
