import { PrismaClient, Priority, TaskStatus, SleepStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a default user for seeding
  const user = await prisma.user.upsert({
    where: { email: 'test@lifeos.local' },
    update: {},
    create: {
      googleId: 'test-google-id-123',
      email: 'test@lifeos.local',
      name: 'Test User',
      avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=testuser',
    },
  })

  console.log(`Created test user with id: ${user.id}`)

  // Clear existing data for this user
  await prisma.task.deleteMany({ where: { userId: user.id } })
  await prisma.habit.deleteMany({ where: { userId: user.id } })
  await prisma.sleepLog.deleteMany({ where: { userId: user.id } })

  // Insert initial Tasks
  const tasks = [
    { title: 'Study Java', category: 'STUDY', priority: Priority.HIGH, status: TaskStatus.TODO },
    { title: 'Complete assignment', category: 'STUDY', priority: Priority.HIGH, status: TaskStatus.TODO },
    { title: 'Project work', category: 'WORK', priority: Priority.MEDIUM, status: TaskStatus.TODO },
    { title: 'Workout', category: 'HEALTH', priority: Priority.HIGH, status: TaskStatus.TODO },
    { title: 'Read 20 pages', category: 'GROWTH', priority: Priority.LOW, status: TaskStatus.TODO },
  ]

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        userId: user.id,
        scheduledAt: new Date(),
      }
    })
  }

  console.log(`Inserted ${tasks.length} tasks`)

  // Insert initial Habits
  const habits = [
    { title: 'Wake up on time', frequency: 'Daily', targetPerWeek: 7, isActive: true },
    { title: 'Drink water', frequency: 'Daily', targetPerWeek: 7, isActive: true },
    { title: 'Meditation', frequency: 'Daily', targetPerWeek: 7, isActive: true },
    { title: 'Reading', frequency: 'Daily', targetPerWeek: 7, isActive: true },
    { title: 'Exercise', frequency: '4x/week', targetPerWeek: 4, isActive: true },
  ]

  for (const habit of habits) {
    const createdHabit = await prisma.habit.create({
      data: {
        ...habit,
        userId: user.id,
      }
    })
    
    // Simulate some streak by adding completions
    if (habit.title !== 'Meditation' && habit.title !== 'Exercise') {
      const today = new Date().toISOString().split('T')[0]
      await prisma.habitCompletion.create({
        data: {
          habitId: createdHabit.id,
          userId: user.id,
          completedDate: today,
        }
      })
    }
  }
  
  console.log(`Inserted ${habits.length} habits`)

  // Insert initial Sleep Log
  const sleepStart = new Date()
  sleepStart.setHours(23, 47, 0, 0)
  
  const wakeTime = new Date()
  wakeTime.setDate(wakeTime.getDate() + 1)
  wakeTime.setHours(7, 18, 0, 0)

  await prisma.sleepLog.create({
    data: {
      userId: user.id,
      sleepStart,
      wakeTime,
      durationMinutes: 451, // 7h 31m
      targetMinutes: 450, // 7h 30m
      status: SleepStatus.GOOD,
    }
  })

  console.log('Inserted 1 sleep log')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
